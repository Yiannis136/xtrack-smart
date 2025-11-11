from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import csv
import io
import json
from bson import json_util
import zipfile
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Vehicle Tracking System")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserRole:
    ADMIN = "admin"
    USER = "user"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    role: str = UserRole.USER
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = UserRole.USER

class UserLogin(BaseModel):
    username: str
    password: str

class License(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    start_date: datetime
    end_date: datetime
    duration_months: int
    status: str = "active"  # active, expired, warning
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LicenseCreate(BaseModel):
    start_date: str  # YYYY-MM-DD
    duration_months: int  # 1, 6, or 12

class LicenseRenewal(BaseModel):
    duration_months: int

class TrackingRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    record_type: str  # "ibutton" or "vehicle"
    date: datetime
    driver: Optional[str] = None
    ibutton: Optional[str] = None
    vehicle: Optional[str] = None
    address: str
    latitude: float
    longitude: float
    uploaded_by: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SystemStatus(BaseModel):
    license_status: str
    license_expiry: datetime
    days_remaining: int
    total_users: int
    total_records: int
    is_setup_complete: bool

# ==================== HELPER FUNCTIONS ====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        user = await db.users.find_one({"username": username}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: Dict = Depends(get_current_user)) -> Dict:
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def check_license_status() -> Dict:
    license_doc = await db.licenses.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
    if not license_doc:
        return {"status": "not_setup", "expired": True, "days_remaining": 0}
    
    end_date = datetime.fromisoformat(license_doc["end_date"]) if isinstance(license_doc["end_date"], str) else license_doc["end_date"]
    now = datetime.now(timezone.utc)
    days_remaining = (end_date - now).days
    
    if days_remaining < 0:
        status_text = "expired"
    elif days_remaining <= 30:
        status_text = "warning"
    else:
        status_text = "active"
    
    return {
        "status": status_text,
        "expired": days_remaining < 0,
        "days_remaining": days_remaining,
        "end_date": end_date
    }

async def require_valid_license(current_user: Dict = Depends(get_current_user)):
    license_status = await check_license_status()
    if license_status["expired"] and current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="License expired. Contact administrator.")
    return current_user

def clean_text_field(text: str) -> str:
    """Clean text fields - hide garbled characters"""
    if not text:
        return text
    
    # Check if text contains question marks (encoding issues)
    if '?' in text:
        # Extract any ID or number prefix
        if text.startswith('Id-'):
            # Keep the ID part but hide the garbled name
            return 'Id- [Name Hidden]'
        elif text.startswith('(') and ')' in text:
            # For vehicle format like "(23) LAB 375 - ???"
            parts = text.split(')', 1)
            if len(parts) > 1:
                number_part = parts[0] + ')'
                rest = parts[1].strip()
                # Check if rest has question marks
                if '?' in rest:
                    # Extract readable parts (plate numbers, etc)
                    readable = ''.join(c for c in rest if c.isascii() or c.isdigit() or c in ' -')
                    readable = ' '.join(readable.split())  # Clean whitespace
                    if readable and len(readable) > 3:
                        return f"{number_part} {readable}"
                    return f"{number_part} [Vehicle Name Hidden]"
        
        # For other cases, try to extract readable parts
        readable = ''.join(c for c in text if c.isascii() or c.isdigit() or c in ' -(),.')
        readable = ' '.join(readable.split())  # Clean whitespace
        
        if readable and len(readable) > 3:
            return readable
        
        return 'N/A'
    
    return text

def parse_csv_auto(content: str) -> tuple[str, List[Dict]]:
    """Auto-detect CSV format and parse"""
    lines = content.strip().split('\n')
    if not lines:
        raise ValueError("Empty CSV file")
    
    reader = csv.DictReader(io.StringIO(content))
    headers = reader.fieldnames
    
    if not headers:
        raise ValueError("No headers found in CSV")
    
    # Detect format
    if 'iButton' in headers or 'Driver' in headers:
        record_type = 'ibutton'
    elif 'Vehicle' in headers:
        record_type = 'vehicle'
    else:
        raise ValueError("Unknown CSV format")
    
    records = []
    for row in reader:
        try:
            # Parse date
            date_str = row.get('Date', '')
            # Handle format: 03/Nov/202506:12:38
            if '/' in date_str and len(date_str) > 15:
                # Split date and time
                parts = date_str.split('/')
                if len(parts) == 3:
                    day = parts[0]
                    month = parts[1]
                    year_time = parts[2]
                    # Extract year (first 4 digits) and time (rest)
                    year = year_time[:4]
                    time_part = year_time[4:] if len(year_time) > 4 else '00:00:00'
                    # Add colons to time if missing
                    if ':' not in time_part:
                        time_part = f"{time_part[:2]}:{time_part[2:4]}:{time_part[4:6]}" if len(time_part) >= 6 else '00:00:00'
                    date_str = f"{day}/{month}/{year} {time_part}"
            
            parsed_date = datetime.strptime(date_str, '%d/%b/%Y %H:%M:%S')
            
            record = {
                'record_type': record_type,
                'date': parsed_date.isoformat(),
                'address': row.get('Address', ''),
                'latitude': float(row.get('Latitude', 0)),
                'longitude': float(row.get('Longitude', 0))
            }
            
            if record_type == 'ibutton':
                driver_name = clean_text_field(row.get('Driver', ''))
                record['driver'] = driver_name if driver_name != 'N/A' else 'Driver'
                record['ibutton'] = row.get('iButton', '')
            else:
                vehicle_name = clean_text_field(row.get('Vehicle', ''))
                record['vehicle'] = vehicle_name if vehicle_name != 'N/A' else 'Vehicle'
            
            records.append(record)
        except Exception as e:
            logger.error(f"Error parsing row: {row}, error: {str(e)}")
            continue
    
    return record_type, records

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Vehicle Tracking System API"}

@api_router.get("/system/status")
async def get_system_status():
    """Get system status - no auth required for initial setup check"""
    setup_complete = await db.system.find_one({"key": "setup_complete"})
    is_setup = setup_complete.get("value", False) if setup_complete else False
    
    if not is_setup:
        return {
            "is_setup_complete": False,
            "license_status": "not_setup",
            "message": "Initial setup required"
        }
    
    license_status = await check_license_status()
    total_users = await db.users.count_documents({})
    total_records = await db.tracking_records.count_documents({})
    
    return SystemStatus(
        license_status=license_status["status"],
        license_expiry=license_status.get("end_date", datetime.now(timezone.utc)),
        days_remaining=license_status["days_remaining"],
        total_users=total_users,
        total_records=total_records,
        is_setup_complete=is_setup
    )

@api_router.post("/setup/initial")
async def initial_setup(license_data: LicenseCreate, admin_password: str = "SeatAteca@842342"):
    """Initial system setup - creates admin, license (12 months), and default ANDREAS user"""
    setup_complete = await db.system.find_one({"key": "setup_complete"})
    if setup_complete and setup_complete.get("value"):
        raise HTTPException(status_code=400, detail="Setup already completed")
    
    # Create admin user
    admin_user = User(
        username="admin",
        password_hash=get_password_hash(admin_password),
        role=UserRole.ADMIN
    )
    
    admin_doc = admin_user.model_dump()
    admin_doc["created_at"] = admin_doc["created_at"].isoformat()
    await db.users.insert_one(admin_doc)
    
    # Create default ANDREAS user
    andreas_user = User(
        username="ANDREAS",
        password_hash=get_password_hash("99552590"),
        role=UserRole.USER,
        created_by="system"
    )
    
    andreas_doc = andreas_user.model_dump()
    andreas_doc["created_at"] = andreas_doc["created_at"].isoformat()
    await db.users.insert_one(andreas_doc)
    
    # Create license - ALWAYS 12 months (1 year)
    start_date = datetime.now(timezone.utc)
    end_date = start_date + timedelta(days=365)  # 12 months = 365 days
    
    license_obj = License(
        start_date=start_date,
        end_date=end_date,
        duration_months=12  # Fixed to 12 months
    )
    
    license_doc = license_obj.model_dump()
    license_doc["start_date"] = license_doc["start_date"].isoformat()
    license_doc["end_date"] = license_doc["end_date"].isoformat()
    license_doc["created_at"] = license_doc["created_at"].isoformat()
    license_doc["updated_at"] = license_doc["updated_at"].isoformat()
    await db.licenses.insert_one(license_doc)
    
    # Mark setup as complete
    await db.system.update_one(
        {"key": "setup_complete"},
        {"$set": {"value": True}},
        upsert=True
    )
    
    return {
        "message": "Setup completed successfully", 
        "admin_username": "admin",
        "default_user": "ANDREAS",
        "license_duration": "12 months"
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check license for non-admin users
    license_status = await check_license_status()
    if license_status["expired"] and user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="License expired. Contact administrator.")
    
    access_token = create_access_token({"sub": user["username"], "role": user["role"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "role": user["role"]
        },
        "license_status": license_status
    }

@api_router.post("/users/create")
async def create_user(user_data: UserCreate, current_user: Dict = Depends(require_valid_license)):
    existing = await db.users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = User(
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        created_by=current_user["username"]
    )
    
    user_doc = new_user.model_dump()
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    await db.users.insert_one(user_doc)
    
    return {"message": "User created successfully", "username": new_user.username}

@api_router.get("/users/list")
async def list_users(current_user: Dict = Depends(require_valid_license)):
    # Filter out admin user from the list
    users = await db.users.find(
        {"username": {"$ne": "admin"}},  # Exclude admin
        {"_id": 0, "password_hash": 0}
    ).to_list(1000)
    return {"users": users}

@api_router.delete("/users/{username}")
async def delete_user(username: str, current_user: Dict = Depends(require_valid_license)):
    # Prevent deleting admin or ANDREAS
    if username in ["admin", "ANDREAS"]:
        raise HTTPException(status_code=400, detail="Cannot delete system users")
    
    result = await db.users.delete_one({"username": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

@api_router.get("/license/current")
async def get_current_license(current_user: Dict = Depends(get_current_user)):
    license_doc = await db.licenses.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
    if not license_doc:
        raise HTTPException(status_code=404, detail="No license found")
    
    license_status = await check_license_status()
    license_doc["status_info"] = license_status
    
    return license_doc

@api_router.post("/license/renew")
async def renew_license(renewal: LicenseRenewal, admin: Dict = Depends(get_admin_user)):
    current_license = await db.licenses.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
    if not current_license:
        raise HTTPException(status_code=404, detail="No license found")
    
    # Renewal starts from current end_date
    current_end = datetime.fromisoformat(current_license["end_date"]) if isinstance(current_license["end_date"], str) else current_license["end_date"]
    new_end_date = current_end + timedelta(days=30 * renewal.duration_months)
    
    new_license = License(
        start_date=current_end,
        end_date=new_end_date,
        duration_months=renewal.duration_months
    )
    
    license_doc = new_license.model_dump()
    license_doc["start_date"] = license_doc["start_date"].isoformat()
    license_doc["end_date"] = license_doc["end_date"].isoformat()
    license_doc["created_at"] = license_doc["created_at"].isoformat()
    license_doc["updated_at"] = license_doc["updated_at"].isoformat()
    await db.licenses.insert_one(license_doc)
    
    return {
        "message": "License renewed successfully",
        "new_expiry": new_end_date.isoformat(),
        "duration_months": renewal.duration_months
    }

@api_router.post("/tracking/add-manual")
async def add_manual_trip(
    trip_data: Dict[str, Any],
    current_user: Dict = Depends(require_valid_license)
):
    """Add a manual trip entry"""
    try:
        # Create record
        record = {
            'id': str(uuid.uuid4()),
            'record_type': trip_data.get('record_type', 'ibutton'),
            'date': trip_data['date'],
            'address': trip_data.get('address', 'Manual Entry'),
            'latitude': float(trip_data.get('latitude', 0)),
            'longitude': float(trip_data.get('longitude', 0)),
            'uploaded_by': current_user['username'],
            'uploaded_at': datetime.now(timezone.utc).isoformat(),
            'manual_entry': True
        }
        
        if record['record_type'] == 'ibutton':
            record['driver'] = trip_data.get('driver', 'Manual Entry')
            record['ibutton'] = trip_data['identifier']
        else:
            # For vehicle type, the identifier IS the vehicle
            # Use trip_data['vehicle'] if provided, otherwise use identifier as vehicle name
            record['vehicle'] = trip_data.get('vehicle') or trip_data['identifier']
        
        # Check for duplicate
        existing = await db.tracking_records.find_one({
            "date": record['date'],
            "$or": [
                {"ibutton": record.get('ibutton', '')} if record['record_type'] == 'ibutton' else {"vehicle": ""},
                {"vehicle": record.get('vehicle', '')} if record['record_type'] == 'vehicle' else {"ibutton": ""}
            ],
            "latitude": record['latitude'],
            "longitude": record['longitude']
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Trip already exists at this time and location")
        
        # Insert record
        await db.tracking_records.insert_one(record)
        
        # Remove MongoDB's _id from response (not JSON serializable)
        if '_id' in record:
            del record['_id']
        
        return {
            "message": "Manual trip added successfully",
            "record": record
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding manual trip: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to add trip: {str(e)}")

@api_router.post("/tracking/upload")
async def upload_tracking_data(
    file: UploadFile = File(...),
    current_user: Dict = Depends(require_valid_license)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    
    # Try multiple encodings for better Greek character support
    try:
        content_str = content.decode('utf-8')
    except UnicodeDecodeError:
        try:
            content_str = content.decode('iso-8859-7')  # Greek encoding
        except UnicodeDecodeError:
            try:
                content_str = content.decode('windows-1253')  # Greek Windows
            except UnicodeDecodeError:
                content_str = content.decode('utf-8', errors='replace')
    
    try:
        record_type, records = parse_csv_auto(content_str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}")
    
    # Check for duplicates and filter them out
    new_records = []
    duplicate_count = 0
    
    for record in records:
        # Create unique key based on: date + identifier + location
        if record_type == 'ibutton':
            identifier = record.get('ibutton', '')
        else:
            identifier = record.get('vehicle', '')
        
        # Check if record already exists (same date, identifier, and coordinates)
        existing = await db.tracking_records.find_one({
            "date": record['date'],
            "$or": [
                {"ibutton": identifier} if record_type == 'ibutton' else {"vehicle": ""},
                {"vehicle": identifier} if record_type == 'vehicle' else {"ibutton": ""}
            ],
            "latitude": record['latitude'],
            "longitude": record['longitude']
        })
        
        if existing:
            duplicate_count += 1
            logger.info(f"Duplicate found: {identifier} at {record['date']}")
        else:
            # Add metadata only to new records
            record['id'] = str(uuid.uuid4())
            record['uploaded_by'] = current_user['username']
            record['uploaded_at'] = datetime.now(timezone.utc).isoformat()
            new_records.append(record)
    
    # Insert only new records
    if new_records:
        await db.tracking_records.insert_many(new_records)
    
    return {
        "message": "Data uploaded successfully",
        "record_type": record_type,
        "records_count": len(records),
        "new_records": len(new_records),
        "duplicates_skipped": duplicate_count
    }

@api_router.get("/tracking/records")
async def get_tracking_records(
    record_type: Optional[str] = None,
    identifier: Optional[str] = None,  # ibutton or vehicle or "all"
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: Dict = Depends(require_valid_license)
):
    query = {}
    
    if record_type:
        query["record_type"] = record_type
    
    # If identifier is "all", don't filter by identifier
    if identifier and identifier.lower() != "all":
        query["$or"] = [
            {"ibutton": identifier},
            {"vehicle": identifier}
        ]
    
    if start_date and end_date:
        query["date"] = {
            "$gte": start_date,
            "$lte": end_date
        }
    
    records = await db.tracking_records.find(query, {"_id": 0}).to_list(10000)
    
    # If "all" is selected, group records by identifier
    if identifier and identifier.lower() == "all":
        # Group by iButton or Vehicle
        grouped_records = {}
        for record in records:
            key = record.get('ibutton') or record.get('vehicle', 'Unknown')
            if key not in grouped_records:
                grouped_records[key] = []
            grouped_records[key].append(record)
        
        return {
            "records": records,
            "count": len(records),
            "grouped": grouped_records,
            "identifiers": list(grouped_records.keys())
        }
    
    return {"records": records, "count": len(records)}

@api_router.get("/tracking/identifiers")
async def get_unique_identifiers(current_user: Dict = Depends(require_valid_license)):
    """Get unique iButtons and Vehicles"""
    ibuttons = await db.tracking_records.distinct("ibutton")
    vehicles = await db.tracking_records.distinct("vehicle")
    
    # Filter out None values
    ibuttons = [ib for ib in ibuttons if ib]
    vehicles = [v for v in vehicles if v]
    
    return {
        "ibuttons": ibuttons,
        "vehicles": vehicles
    }

@api_router.get("/tracking/stats")
async def get_tracking_stats(current_user: Dict = Depends(require_valid_license)):
    """Get tracking statistics"""
    total_records = await db.tracking_records.count_documents({})
    total_ibuttons = len(await db.tracking_records.distinct("ibutton"))
    total_vehicles = len(await db.tracking_records.distinct("vehicle"))
    
    # Get upload statistics
    upload_stats = await db.tracking_records.aggregate([
        {
            "$group": {
                "_id": "$uploaded_by",
                "count": {"$sum": 1},
                "last_upload": {"$max": "$uploaded_at"}
            }
        }
    ]).to_list(100)
    
    return {
        "total_records": total_records,
        "unique_ibuttons": total_ibuttons,
        "unique_vehicles": total_vehicles,
        "uploads_by_user": upload_stats
    }

@api_router.post("/backup/create")
async def create_backup(admin: Dict = Depends(get_admin_user)):
    """Create a full system backup"""
    try:
        # Export all collections
        backup_data = {
            "backup_date": datetime.now(timezone.utc).isoformat(),
            "users": await db.users.find({}, {"_id": 0}).to_list(10000),
            "licenses": await db.licenses.find({}, {"_id": 0}).to_list(10000),
            "tracking_records": await db.tracking_records.find({}, {"_id": 0}).to_list(100000),
            "system": await db.system.find({}, {"_id": 0}).to_list(100)
        }
        
        # Convert to JSON string
        backup_json = json.dumps(backup_data, default=str)
        
        # Encode to base64
        backup_base64 = base64.b64encode(backup_json.encode()).decode()
        
        return {
            "message": "Backup created successfully",
            "backup_data": backup_base64,
            "records_count": len(backup_data["tracking_records"]),
            "users_count": len(backup_data["users"])
        }
    except Exception as e:
        logger.error(f"Backup error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

@api_router.post("/backup/restore")
async def restore_backup(
    file: UploadFile = File(...),
    admin: Dict = Depends(get_admin_user)
):
    """Restore system from backup"""
    try:
        content = await file.read()
        
        # Try to decode from base64 first (if it's from our create_backup)
        try:
            decoded = base64.b64decode(content)
            backup_data = json.loads(decoded)
        except:
            # If not base64, try direct JSON
            backup_data = json.loads(content)
        
        # Clear existing data (except current admin session)
        current_admin = await db.users.find_one({"username": admin["username"]})
        
        # Restore collections
        if backup_data.get("users"):
            await db.users.delete_many({})
            await db.users.insert_many(backup_data["users"])
        
        if backup_data.get("licenses"):
            await db.licenses.delete_many({})
            await db.licenses.insert_many(backup_data["licenses"])
        
        if backup_data.get("tracking_records"):
            await db.tracking_records.delete_many({})
            if backup_data["tracking_records"]:
                await db.tracking_records.insert_many(backup_data["tracking_records"])
        
        if backup_data.get("system"):
            await db.system.delete_many({})
            await db.system.insert_many(backup_data["system"])
        
        return {
            "message": "Restore completed successfully",
            "restored_users": len(backup_data.get("users", [])),
            "restored_records": len(backup_data.get("tracking_records", []))
        }
    except Exception as e:
        logger.error(f"Restore error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_indexes():
    """Create database indexes for performance and duplicate detection"""
    try:
        # Index for duplicate detection
        await db.tracking_records.create_index([
            ("date", 1),
            ("ibutton", 1),
            ("latitude", 1),
            ("longitude", 1)
        ], name="duplicate_detection_ibutton")
        
        await db.tracking_records.create_index([
            ("date", 1),
            ("vehicle", 1),
            ("latitude", 1),
            ("longitude", 1)
        ], name="duplicate_detection_vehicle")
        
        # Indexes for fast queries
        await db.tracking_records.create_index([("ibutton", 1)])
        await db.tracking_records.create_index([("vehicle", 1)])
        await db.tracking_records.create_index([("date", 1)])
        await db.tracking_records.create_index([("uploaded_by", 1)])
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
