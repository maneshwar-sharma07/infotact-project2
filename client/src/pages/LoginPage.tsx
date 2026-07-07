import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="bg-bg-surface p-8 rounded-lg border border-border w-96">
        <h1 className="text-3xl font-bold text-accent-primary mb-6">Login</h1>
        <form>
          <input type="email" placeholder="Email" className="w-full p-3 bg-bg-primary border border-border rounded mb-4 text-text-primary" />
          <input type="password" placeholder="Password" className="w-full p-3 bg-bg-primary border border-border rounded mb-4 text-text-primary" />
          <button className="w-full bg-accent-primary text-white p-3 rounded hover:opacity-90">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
