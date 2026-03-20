import { useState } from 'react';
import { ShieldCheck, ArrowRight, MapPin, Umbrella } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState('');
  
  const platforms = [
    { id: 'zomato', name: 'Zomato', color: '#E23744' },
    { id: 'swiggy', name: 'Swiggy', color: '#FC8019' },
    { id: 'zepto', name: 'Zepto', color: '#3A0B4B' },
    { id: 'amazon', name: 'Amazon Flex', color: '#FF9900' }
  ];

  const handleComplete = () => {
    // Navigate to Policy to calculate premium based on profile
    navigate('/policy');
  };

  return (
    <div className="onboarding-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Welcome to GigGuard</h1>
        <p className="page-subtitle">Let's set up your income protection profile</p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', marginTop: '2rem' }}>
        {step === 1 && (
          <div className="step-content animate-fade-in">
            <h2 className="text-lg font-semibold mb-4" style={{ marginBottom: '1.5rem' }}>Which platform do you primarily deliver for?</h2>
            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '2rem' }}>
              {platforms.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  style={{ 
                    padding: '1.5rem', 
                    border: `2px solid ${platform === p.id ? p.color : 'var(--border-color)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: platform === p.id ? `${p.color}20` : 'var(--bg-elevated)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: p.color }} />
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                </div>
              ))}
            </div>
            <button 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', opacity: platform ? 1 : 0.5 }}
              onClick={() => platform && setStep(2)}
              disabled={!platform}
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content animate-fade-in">
            <h2 className="text-lg font-semibold" style={{ marginBottom: '1.5rem' }}>Tell us about your delivery zone</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Primary City</label>
                <select style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}>
                  <option>Mumbai</option>
                  <option>Delhi NCR</option>
                  <option>Bengaluru</option>
                  <option>Chennai</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Average Weekly Deliveries</label>
                <input type="number" defaultValue={120} style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '0.75rem' }}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={handleComplete}
              >
                Calculate My Premium <ShieldCheck size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', color: 'var(--text-muted)' }}>
        <div style={{ flex: 1, background: 'var(--bg-elevated)', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <Umbrella className="text-accent-primary" />
          <div>
            <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>Inclement Weather</h4>
            <p className="text-sm">Protected against heavy rain, floods, and extreme heat waves.</p>
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-elevated)', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <MapPin className="text-warning" />
          <div>
            <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>Social Disruptions</h4>
            <p className="text-sm">Protected against unplanned curfews and zone closures.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
