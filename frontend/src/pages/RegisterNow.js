import React, { useState } from 'react';

const RegisterNow = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    // Εδώ θα βάλεις το backend registration σου με fetch/axios
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-violet-400 to-blue-300 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
        {/* Glamorous Shine Overlay */}
        <div className="absolute -top-12 -right-12 h-32 w-32 bg-gradient-to-tr from-violet-300 via-indigo-200 to-blue-100 opacity-30 rounded-full pointer-events-none blur-2xl"></div>
        {/* Logo Icon */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 p-4 shadow-lg">
            <svg className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-center mb-3 bg-gradient-to-r from-indigo-700 via-violet-500 to-blue-500 bg-clip-text text-transparent">
          Create your account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Join Xtrack Smart and unlock your dashboard!
        </p>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@email.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Choose a strong password"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-400 text-white font-bold rounded-lg shadow-md hover:scale-105 hover:from-indigo-600 transition-all duration-150"
          >
            Register
          </button>
        </form>
        {success && (
          <div className="mt-6 text-center text-green-600 font-semibold transition-opacity duration-500">
            Registration successful! 🚀
          </div>
        )}
        <div className="mt-8 text-center text-sm text-gray-400">
          Already registered? <a href="/login" className="text-indigo-600 underline transition hover:text-indigo-900">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterNow;
