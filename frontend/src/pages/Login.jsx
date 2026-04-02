import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://192.168.0.101:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ 
      paddingTop: '120px', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, rgba(198, 19, 19, 0.1) 0%, var(--bg-color) 100%)'
    }}>
      <div className="glass" style={{ 
        padding: '3rem', 
        borderRadius: '24px', 
        width: '100%', 
        maxWidth: '430px',
        textAlign: 'center'
      }}>
        <span className="badge">Admin Access</span>
        <h2 style={{ fontSize: '2.5rem', margin: '1.5rem 0 1rem' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Please enter your credentials to access the STC Dashboard.</p>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(198, 19, 19, 0.1)', color: 'var(--primary)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.9rem', marginBottom: '0.6rem' }}>STC ID / Username</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.9rem', marginBottom: '0.6rem' }}>Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Login to Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;
