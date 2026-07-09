import React, { useState } from 'react';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    setTimeout(() => {
      setLoading(false);
      console.log('Signup:', { name, email, password });
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#111118', padding: '2rem', borderRadius: '8px', border: '1px solid #1E293B', width: '384px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#7C3AED', marginBottom: '1.5rem' }}>Sign Up</h1>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0F', border: '1px solid #1E293B', borderRadius: '4px', marginBottom: '1rem', color: '#F1F5F9' }}
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0F', border: '1px solid #1E293B', borderRadius: '4px', marginBottom: '1rem', color: '#F1F5F9' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0F', border: '1px solid #1E293B', borderRadius: '4px', marginBottom: '1rem', color: '#F1F5F9' }}
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0A0A0F', border: '1px solid #1E293B', borderRadius: '4px', marginBottom: '1rem', color: '#F1F5F9' }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#06B6D4', color: 'white', padding: '0.75rem', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p style={{ color: '#64748B', textAlign: 'center', marginTop: '1rem' }}>
          Already have an account? <a href="/login" style={{ color: '#7C3AED' }}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
