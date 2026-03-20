import { useState } from 'react';
import { Shield, Zap, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Policy() {
  const navigate = useNavigate();
  const [purchased, setPurchased] = useState(false);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">AI Risk Profiler & Policy</h1>
          <p className="page-subtitle">Personalized weekly pricing based on local risk data</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Zap className="text-warning" size={20} />
              This Week's AI Risk Assessment
            </h3>
            
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Our AI models have analyzed weather patterns, traffic metrics, and social data for <strong>Mumbai (Andheri East)</strong> for <strong>March 24 - March 31</strong>.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Weather Risk</span>
                  <span className="text-warning font-semibold">Moderate (45%)</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '45%', height: '100%', background: 'var(--warning)' }}></div>
                </div>
                <p className="text-sm text-muted mt-2">Unseasonal rainfall expected Wed-Thu.</p>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Social Risk</span>
                  <span className="text-success font-semibold">Low (12%)</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '12%', height: '100%', background: 'var(--success)' }}></div>
                </div>
                <p className="text-sm text-muted mt-2">No planned strikes or curfews logged.</p>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Info className="text-accent-primary" size={20} style={{ flexShrink: 0 }} />
              <p className="text-sm">Based on your average earnings of ₹8,500/week on Zomato, we recommend standard income protection against environmental and social disruptions. Health, life, accidents, and vehicle repairs are explicitly excluded.</p>
            </div>
          </div>
        </div>

        <div>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Shield size={48} className="text-accent-primary" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.5rem' }}>Weekly Premium</h2>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.25rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>₹49</span>
                <span className="text-muted">/ week</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                <span>Instant automated payouts via UPI</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                <span>Up to ₹2,500/day income coverage</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                <span>Trigger based on verified weather APIs</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--danger)' }}>
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>Excludes vehicle damage & accidents</span>
              </li>
            </ul>

            {!purchased ? (
              <button 
                className="btn-primary w-full" 
                onClick={() => {
                  setPurchased(true);
                  setTimeout(() => navigate('/'), 2000);
                }}
              >
                Buy 1-Week Policy
              </button>
            ) : (
              <button className="w-full" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'var(--success)', border: 'none', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled>
                <CheckCircle2 size={18} /> Payment Successful
              </button>
            )}
            <p className="text-center text-sm text-muted mt-4">Renews automatically. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple fallback for AlertCircle icon
const AlertCircle = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);
