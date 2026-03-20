import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Users, IndianRupee, Activity, ShieldCheck } from 'lucide-react';

const riskData = [
  { name: 'Mon', risk: 20 },
  { name: 'Tue', risk: 35 },
  { name: 'Wed', risk: 55 },
  { name: 'Thu', risk: 80 },
  { name: 'Fri', risk: 40 },
  { name: 'Sat', risk: 15 },
  { name: 'Sun', risk: 10 },
];

const policyData = [
  { name: 'Week 1', policies: 1200, payouts: 15000 },
  { name: 'Week 2', policies: 1500, payouts: 12000 },
  { name: 'Week 3', policies: 1800, payouts: 45000 },
  { name: 'Week 4', policies: 2200, payouts: 18000 },
];

export default function Analytics() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Analytics Dashboard</h1>
        <p className="page-subtitle">Platform-wide metrics for active gig policies and risk exposure</p>
      </div>

      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted text-sm">Active Weekly Policies</span>
            <Users size={16} className="text-accent-primary" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>2,254</span>
          <span className="text-success text-sm">+18% vs last week</span>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted text-sm">Total Weekly Premium Collected</span>
            <IndianRupee size={16} className="text-success" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹1,69,050</span>
          <span className="text-success text-sm">+22% vs last week</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted text-sm">Parametric Triggers Hit</span>
            <Activity size={16} className="text-warning" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>4</span>
          <span className="text-sm text-muted">This week</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted text-sm">Total Automated Payouts</span>
            <ShieldCheck size={16} className="text-accent-secondary" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹2,84,500</span>
          <span className="text-danger text-sm">Above average</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Predicted Strike/Weather Risk (Current Week)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: 'none', borderRadius: '8px', color: 'white' }} />
                <Area type="monotone" dataKey="risk" stroke="var(--warning)" fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Monthly Overview: Policies vs Payouts</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={policyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis yAxisId="left" stroke="var(--accent-primary)" orientation="left" />
                <YAxis yAxisId="right" stroke="var(--danger)" orientation="right" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: 'none', borderRadius: '8px', color: 'white' }} />
                <Bar yAxisId="left" dataKey="policies" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="payouts" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, background: 'var(--accent-primary)', borderRadius: '2px' }}></div> Active Policies</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, background: 'var(--danger)', borderRadius: '2px' }}></div> Claim Payouts (₹)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
