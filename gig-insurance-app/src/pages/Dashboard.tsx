import { CloudRain, AlertTriangle, IndianRupee, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Welcome back, Rahul. Your income is protected.</p>
        </div>
        <div className="badge badge-success" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
          Coverage Active
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent)' }}>
          <span className="text-muted text-sm flex items-center gap-2"><IndianRupee size={16} /> Covered Income</span>
          <span className="stat-value">₹8,500 <span className="text-sm text-muted font-normal">/ week</span></span>
          <span className="text-success text-sm flex items-center gap-1"><TrendingUp size={14} /> Based on your average</span>
        </div>
        
        <div className="card stat-card">
          <span className="text-muted text-sm flex items-center gap-2"><Clock size={16} /> Current Policy</span>
          <span className="stat-value">Week 12</span>
          <span className="text-muted text-sm">Valid until Mar 24, 2026</span>
        </div>

        <div className="glass-panel stat-card" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <span className="text-warning text-sm flex items-center gap-2"><AlertTriangle size={16} /> AI Risk Level (Mumbai)</span>
          <span className="stat-value text-warning" style={{ fontSize: '1.75rem' }}>Moderate</span>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>20% chance of heavy rain tomorrow</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CloudRain size={20} className="text-accent-primary" />
            Parametric Triggers Watch
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600 }}>Rainfall (Andheri East)</p>
                <p className="text-sm text-muted">Trigger at &gt;50mm / hour</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>12 mm</p>
                <p className="text-success text-sm">Normal</p>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--danger)' }}>
              <div>
                <p style={{ fontWeight: 600 }}>Air Quality (AQI)</p>
                <p className="text-sm text-muted">Trigger at &gt;400</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, color: 'var(--danger)' }}>385</p>
                <p className="text-danger text-sm">Approaching Trigger</p>
              </div>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600 }}>Social Disruptions / Curfews</p>
                <p className="text-sm text-muted">Admin API check</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="text-success text-sm">Clear</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Automated Claims</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-success">Paid Instantly</span>
                <span className="text-sm text-muted">Feb 14, 2026</span>
              </div>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>₹1,250 Payout</p>
              <p className="text-sm text-muted">Triggered by: Unplanned Strike (Zone 4)</p>
            </div>
            
            <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', opacity: 0.6 }}>
              <p style={{ textAlign: 'center', padding: '1rem 0' }}>No other claims in the last 30 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
