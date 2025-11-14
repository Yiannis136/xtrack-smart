import React from 'react';
import './RegisterNow.css';

const RegisterNow = () => {
    const handleRegister = () => {
        // Handle registration logic
    };

    return (
        <div className="register-now">
            <h1>Register Now</h1>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Enter your name" required />
                <input type="email" placeholder="Enter your email" required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterNow;

const RegisterNow = () => {
  return (
    <div>
      <h1>Register Now Page</h1>
      {/* Add registration form fields here */}
    </div>
  );
};

export default RegisterNow;
