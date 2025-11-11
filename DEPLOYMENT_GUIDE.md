# X Track Smart - Deployment Guide

## Οδηγίες για Render.com Deployment

### Προαπαιτούμενα
1. ✅ MongoDB Atlas Database (έχεις ήδη)
2. ✅ Render.com Account (έχεις ήδη)
3. ✅ GitHub Repository

### Environment Variables που χρειάζεσαι:

**MONGO_URL:**
```
mongodb+srv://yiannisioaonu1_db_user:FTDcXNOqeJycy06@cluster0.cmdrw6v.mongodb.net/?appName=Cluster0
```

**DB_NAME:**
```
xtrack_smart
```

---

## Ρυθμίσεις Render.com για Backend Service

### Basic Settings:
- **Name**: `xtrack-smart`
- **Language**: `Python 3`
- **Branch**: `main`
- **Region**: `Oregon (US West)`
- **Root Directory**: `backend`

### Build & Start Commands:
- **Build Command**: 
```bash
pip install -r requirements.txt
```

- **Start Command**:
```bash
uvicorn server:app --host 0.0.0.0 --port $PORT
```

### Environment Variables:
Πρόσθεσε τις παραπάνω μεταβλητές (MONGO_URL και DB_NAME)

### Instance Type:
- **Free** (για testing)

---

## Δομή Φακέλων

```
xtrack-smart/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env.template
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── render.yaml
└── README.md
```

---

## Σημειώσεις
- Το render.yaml περιέχει ήδη όλες τις ρυθμίσεις
- Μόλις ανεβάσεις στο GitHub, το Render θα κάνει auto-deploy
- Αν κάτι πάει στραβά, τσέκαρε τα logs στο Render dashboard
