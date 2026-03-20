import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Zomato');
  const [city, setCity] = useState('Mumbai');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering 
      ? { email, password, name, platform, city }
      : { email, password };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg-dark)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <ShieldCheck size={48} className="text-accent-primary" style={{ margin: '0 auto 1rem' }} />
          <h2>{isRegistering ? 'Create GigGuard Account' : 'Welcome Back'}</h2>
          <p className="text-muted mt-2">Log in to manage your income protection policy</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegistering && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Platform</label>
                  <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white' }}>
                    <option>Zomato</option>
                    <option>Swiggy</option>
                    <option>Zepto</option>
                    <option>Amazon</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>City</label>
                  <select value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white' }}>
                    <option>Mumbai</option>
                    <option>Delhi</option>
                    <option>Bengaluru</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <p className="text-center text-sm text-muted" style={{ marginTop: '1.5rem' }}>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', marginLeft: '0.5rem', fontWeight: 600 }} onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
