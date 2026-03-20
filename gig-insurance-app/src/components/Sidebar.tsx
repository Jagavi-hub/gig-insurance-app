import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  UserCircle, 
  FileText, 
  Activity, 
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <ShieldCheck className="text-accent-primary" size={28} />
        <span>GigGuard AI</span>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        
        <NavLink to="/onboarding" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <UserCircle size={20} />
          Onboarding
        </NavLink>
        
        <NavLink to="/policy" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          Policy & Profile
        </NavLink>
        
        <NavLink to="/claims" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Activity size={20} />
          Parametric Triggers
        </NavLink>

        <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <BarChart3 size={20} />
          Analytics
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          Account Settings
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'User'}</p>
            <p className="text-muted text-sm">{user?.platform || 'Platform'} Partner</p>
          </div>
        </div>
      </div>
    </div>
  );
}
