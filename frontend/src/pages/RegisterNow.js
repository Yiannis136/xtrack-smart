import React, { useState } from 'react';

const RegisterNow = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Εδώ βάζεις fetch/axios για backend registration
    alert('Registration submitted: ' + JSON.stringify(form));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <form className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Register</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full border px-4 py-2 rounded mt-1" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border px-4 py-2 rounded mt-1" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full border px-4 py-2 rounded mt-1" />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Register</button>
      </form>
    </div>
  );
};

export default RegisterNow;
