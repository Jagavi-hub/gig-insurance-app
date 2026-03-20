import { useState } from 'react';
import { Activity, ShieldAlert, CheckCircle, CloudLightning, Activity as StrikeIcon } from 'lucide-react';

export default function Claims() {
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Parametric Engine & Claims</h1>
          <p className="page-subtitle">Real-time external triggers and automated payout logs</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-elevated)', padding: '0.5rem', borderRadius: '8px' }}>
          <button 
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: activeTab === 'live' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'live' ? 'white' : 'var(--text-muted)', fontWeight: activeTab === 'live' ? 600 : 400 }}
            onClick={() => setActiveTab('live')}
          >
            Live Triggers
          </button>
          <button 
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: activeTab === 'fraud' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'fraud' ? 'white' : 'var(--text-muted)', fontWeight: activeTab === 'fraud' ? 600 : 400 }}
            onClick={() => setActiveTab('fraud')}
          >
            Fraud Detection & Logs
          </button>
        </div>
      </div>

      {activeTab === 'live' ? (
        <div className="grid grid-cols-2 gap-6 animate-fade-in">
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity className="text-accent-primary" size={20} />
              Live API Feeds (Mumbai)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CloudLightning size={16} /> IMD Weather API</span>
                  <span className="text-warning text-sm">Update 2m ago</span>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p className="text-sm">Current Rainfall (Andheri East)</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>48 mm/h</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="text-sm">Trigger Threshold</p>
                      <p style={{ fontWeight: 600 }}>50 mm/h</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><StrikeIcon size={16} /> Local News / Gov API</span>
                  <span className="text-muted text-sm">Update 15m ago</span>
                </div>
                <div className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p className="text-sm">Active Curfews / Strikes</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>None Recorded</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle className="text-success" size={20} />
              Recent Triggered Payouts
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>P0982 - Swiggy Partner</span>
                    <span style={{ fontWeight: 600 }}>₹800 Payout</span>
                  </div>
                  <p className="text-sm text-muted">Trigger: Extreme Heatwave (AQI&gt;400 & Temp&gt;42°C)</p>
                  <p className="text-sm text-muted mt-1">Processed automatically via UPI at 14:30 PM (Today)</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>P1044 - Zepto Partner</span>
                    <span style={{ fontWeight: 600 }}>₹1,500 Payout</span>
                  </div>
                  <p className="text-sm text-muted">Trigger: Flooding / Very Heavy Rain (Bandra)</p>
                  <p className="text-sm text-muted mt-1">Processed automatically via UPI at 09:15 AM (Yesterday)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert className="text-danger" size={20} />
            AI Fraud & Anomaly Detection Logs
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Claim ID</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Trigger Source</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Risk Flag</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>AI Rationale</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 0', fontWeight: 600 }}>CL-5509</td>
                <td style={{ padding: '1rem 0' }}>Manual Override Request</td>
                <td style={{ padding: '1rem 0' }}><span className="badge badge-danger">High - Duplicate</span></td>
                <td style={{ padding: '1rem 0' }}><span className="text-danger font-semibold">Rejected</span></td>
                <td style={{ padding: '1rem 0' }} className="text-sm text-muted">Policy holder already paid out for same weather event ID W-092.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 0', fontWeight: 600 }}>CL-5488</td>
                <td style={{ padding: '1rem 0' }}>Location Spoofing Detected</td>
                <td style={{ padding: '1rem 0' }}><span className="badge badge-danger">Critical Anomaly</span></td>
                <td style={{ padding: '1rem 0' }}><span className="text-danger font-semibold">Rejected</span></td>
                <td style={{ padding: '1rem 0' }} className="text-sm text-muted">Claimed flood location (Zone B), but phone cell tower ping was Zone E (dry).</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 0', fontWeight: 600 }}>CL-5510</td>
                <td style={{ padding: '1rem 0' }}>Parametric Auto-Trigger</td>
                <td style={{ padding: '1rem 0' }}><span className="badge badge-warning">Review</span></td>
                <td style={{ padding: '1rem 0' }}><span className="text-warning font-semibold">Hold - Validation</span></td>
                <td style={{ padding: '1rem 0' }} className="text-sm text-muted">API recorded strike, but partner's platform activity shows deliveries completed during that time. Pending cross-API check.</td>
              </tr>
               <tr>
                <td style={{ padding: '1rem 0', fontWeight: 600 }}>CL-5490</td>
                <td style={{ padding: '1rem 0' }}>Parametric Auto-Trigger</td>
                <td style={{ padding: '1rem 0' }}><span className="badge badge-success">Clear</span></td>
                <td style={{ padding: '1rem 0' }}><span className="text-success font-semibold">Processed</span></td>
                <td style={{ padding: '1rem 0' }} className="text-sm text-muted">Weather event matches geolocation constraint. No anomalies found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
