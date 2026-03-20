import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, token, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [platform, setPlatform] = useState(user?.platform || '');
  const [city, setCity] = useState(user?.city || '');
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPlatform(user.platform);
      setCity(user.city);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/profile/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, platform, city })
      });
      
      if (!res.ok) throw new Error('Failed to update profile');
      const updatedUser = await res.json();
      
      updateUser(updatedUser);
      setMessage('Profile updated successfully in Postgres DB!');
    } catch (err: any) {
      setMessage(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Profile Management</h1>
          <p className="page-subtitle">Update your personal and platform details</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600 }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <UserCircle size={80} className="text-accent-secondary" style={{ margin: '0 auto' }} />
          <h2 className="mt-4">{user.name}</h2>
          <p className="text-muted">{user.email}</p>
        </div>

        {message && (
          <div style={{ padding: '1rem', background: message.includes('success') ? 'var(--success-bg)' : 'var(--danger-bg)', color: message.includes('success') ? 'var(--success)' : 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Primary Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white' }}>
                <option>Zomato</option>
                <option>Swiggy</option>
                <option>Zepto</option>
                <option>Amazon</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>City</label>
              <select value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white' }}>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bengaluru</option>
                <option>Chennai</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }} disabled={saving}>
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
