import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Shield, PieChart as PieChartIcon, ArrowUpRight, 
  ArrowDownRight, Bell, Settings as SettingsIcon, User, Wallet, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';
import api from './api';

const Auth = lazy(() => import('./Auth'));
const Settings = lazy(() => import('./Settings'));
const Markets = lazy(() => import('./Markets'));
const RiskAnalysis = lazy(() => import('./RiskAnalysis'));
const VerifyEmail = lazy(() => import('./Auth').then((m) => ({ default: m.VerifyEmail })));
const ResetPassword = lazy(() => import('./Auth').then((m) => ({ default: m.ResetPassword })));
const Privacy = lazy(() => import('./Legal').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./Legal').then((m) => ({ default: m.Terms })));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[40vh]">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Mock Data
const performanceData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 4500 },
  { name: 'Mar', value: 4200 },
  { name: 'Apr', value: 5800 },
  { name: 'May', value: 5100 },
  { name: 'Jun', value: 6800 },
  { name: 'Jul', value: 7400 },
];

const allocationData = [
  { name: 'Equities', value: 65, color: '#3B82F6' },
  { name: 'Bonds', value: 20, color: '#10B981' },
  { name: 'Crypto', value: 10, color: '#8B5CF6' },
  { name: 'Cash', value: 5, color: '#F59E0B' },
];

const recentTrades = [
  { id: 1, symbol: 'AAPL', type: 'BUY', amount: '+15', price: '$175.50', time: '2h ago', status: 'completed' },
  { id: 2, symbol: 'TSLA', type: 'SELL', amount: '-5', price: '$220.10', time: '4h ago', status: 'completed' },
  { id: 3, symbol: 'MSFT', type: 'BUY', amount: '+2', price: '$330.00', time: '1d ago', status: 'completed' },
];

const Dashboard = ({ handleLogout, userName, onOpenSettings }) => {
  const [activePage, setActivePage] = useState('portfolio');
  const [connecting, setConnecting] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const connectBroker = async () => {
    setConnecting(true);
    setNotice('');
    try {
      const res = await api.post('/api/portfolio/connect', { brokerName: 'Zerodha' });
      setNotice(res.data.notice || 'Broker placeholder portfolio created.');
    } catch (err) {
      setNotice(err.response?.data?.message || 'Could not connect broker');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel rounded-none border-l-0 border-t-0 border-r-0">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Quanterm Logo" className="h-8 w-auto object-contain rounded-lg bg-white p-0.5" />
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Quanterm</h1>
        </div>
        <button onClick={() => setMobileNavOpen(s => !s)} className="p-2 rounded-lg glass-button">
          {mobileNavOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileNavOpen(false)}>
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed left-0 top-0 h-full w-64 bg-[#0d1220] border-r border-white/10 shadow-2xl z-50 flex flex-col p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-8">
              <img src="/logo.png" alt="Quanterm Logo" className="h-10 w-auto object-contain rounded-lg bg-white p-1" />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Quanterm</h1>
            </div>
            <nav className="flex-1 space-y-2">
              <NavItem icon={<PieChartIcon />} label="Portfolio X-Ray" active={activePage==='portfolio'} onClick={() => { setActivePage('portfolio'); setMobileNavOpen(false); }} />
              <NavItem icon={<TrendingUp />}   label="Markets"         active={activePage==='markets'}   onClick={() => { setActivePage('markets'); setMobileNavOpen(false); }}   />
              <NavItem icon={<Wallet />}        label="Brokers"         active={activePage==='brokers'}   onClick={() => { setActivePage('brokers'); setMobileNavOpen(false); }}   />
              <NavItem icon={<Shield />}        label="Risk Analysis"   active={activePage==='risk'}      onClick={() => { setActivePage('risk'); setMobileNavOpen(false); }}      />
            </nav>
            <div className="mt-auto space-y-2">
              <NavItem icon={<SettingsIcon />} label="Settings" onClick={() => { onOpenSettings(); setMobileNavOpen(false); }} />
              <NavItem icon={<User />} label="Profile" onClick={() => { onOpenSettings(); setMobileNavOpen(false); }} />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <User className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex md:w-64 md:min-h-screen glass-panel border-l-0 border-t-0 border-b-0 rounded-none p-4 sm:p-6 flex-col min-w-0"
      >
        <div className="flex items-center gap-3 mb-12">
          <img src="/logo.png" alt="Quanterm Logo" className="h-10 w-auto object-contain rounded-lg bg-white p-1" />
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Quanterm
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<PieChartIcon />} label="Portfolio X-Ray" active={activePage==='portfolio'} onClick={() => setActivePage('portfolio')} />
          <NavItem icon={<TrendingUp />}   label="Markets"         active={activePage==='markets'}   onClick={() => setActivePage('markets')}   />
          <NavItem icon={<Wallet />}        label="Brokers"         active={activePage==='brokers'}   onClick={() => setActivePage('brokers')}   />
          <NavItem icon={<Shield />}        label="Risk Analysis"   active={activePage==='risk'}      onClick={() => setActivePage('risk')}      />
        </nav>

        <div className="mt-auto space-y-2">
          <NavItem icon={<SettingsIcon />} label="Settings" onClick={onOpenSettings} />
          <NavItem icon={<User />} label="Profile" onClick={onOpenSettings} />
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <User className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content — routed */}
      <Suspense fallback={<PageLoader />}>
      {activePage === 'markets' && <Markets />}
      {activePage === 'risk'    && <RiskAnalysis />}
      </Suspense>
      {(activePage === 'portfolio' || activePage === 'brokers') && (
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto min-w-0">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 break-words">Portfolio Intelligence</h2>
            <p className="text-textMuted text-sm sm:text-base">Welcome back, <span className="text-white font-medium">{userName || 'there'}</span>. Here's your unified view.</p>
          </motion.div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button className="p-2.5 rounded-full glass-button relative">
              <Bell className="w-5 h-5 text-white/80" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={connectBroker} disabled={connecting} className="glass-button flex items-center gap-2 font-medium text-sm">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
              Connect Broker
            </button>
          </div>
        </header>
        {notice && <p className="mb-4 text-xs sm:text-sm text-amber-300">{notice}</p>}
        <p className="mb-6 text-[11px] sm:text-xs text-textMuted">Analytics only — not investment advice. Market data may be delayed. NSE/BSE redistribution requires a licence.</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Net Worth" 
            value="$124,500.00" 
            trend="+12.5%" 
            isPositive={true} 
            delay={0.1}
          />
          <StatCard 
            title="Today's Return" 
            value="+$1,240.50" 
            trend="+1.02%" 
            isPositive={true} 
            delay={0.2}
          />
          <StatCard 
            title="Risk Score" 
            value="Moderate" 
            trend="65/100" 
            isPositive={false} 
            delay={0.3}
            neutral
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-panel p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Performance Overview</h3>
              <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 text-white">
                <option>All Brokers</option>
                <option>Zerodha</option>
                <option>Groww</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(11, 15, 25, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{r: 8, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Allocation */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-6 flex flex-col"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Asset Allocation</h3>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(11, 15, 25, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-white">4</span>
                  <span className="text-xs text-textMuted">Asset Classes</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {allocationData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-white/80">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-3 glass-panel p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
              <button className="text-sm text-primary hover:text-primary/80 transition-colors">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-sm text-textMuted">
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                            {trade.symbol.charAt(0)}
                          </div>
                          <span className="font-semibold text-white">{trade.symbol}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-4 font-medium text-white/90">{trade.amount}</td>
                      <td className="py-4 font-medium text-white/90">{trade.price}</td>
                      <td className="py-4 text-sm text-textMuted">{trade.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
        </main>
      )}

    </div>
  );
};

// Helper Components
const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
    active 
      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
      : 'text-textMuted hover:text-white hover:bg-white/5'
  }`}>
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, value, trend, isPositive, delay, neutral }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="glass-panel p-6 relative overflow-hidden group"
  >
    {/* Subtle gradient glow effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500"></div>
    
    <div className="relative z-10">
      <h4 className="text-textMuted text-sm font-medium mb-2">{title}</h4>
      <div className="text-2xl sm:text-3xl font-bold text-white mb-3 break-words">{value}</div>
      <div className="flex items-center gap-2">
        <span className={`flex items-center text-sm font-medium ${
          neutral ? 'text-white/60' : isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {!neutral && (isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />)}
          {trend}
        </span>
        <span className="text-xs text-textMuted">vs last month</span>
      </div>
    </div>
  </motion.div>
);

function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/auth/me')
      .then((res) => { if (!cancelled) setUser(res.data.user); })
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setBooting(false); });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
    setUser(null);
  };

  const mergeUser = (partial) => setUser((prev) => ({ ...prev, ...partial }));

  if (booting) return <PageLoader />;

  return (
    <ErrorBoundary>
    <Router>
      <Routes>
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
        <Route path="/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmail /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
        <Route 
          path="/" 
          element={
            user
              ? (
                <>
                  <Dashboard
                    handleLogout={handleLogout}
                    userName={user.name}
                    onOpenSettings={() => setSettingsOpen(true)}
                  />
                  <Suspense fallback={null}>
                    <Settings
                      isOpen={settingsOpen}
                      onClose={() => setSettingsOpen(false)}
                      user={user}
                      onUserUpdate={mergeUser}
                    />
                  </Suspense>
                </>
              )
              : <Suspense fallback={<PageLoader />}><Auth setUser={setUser} /></Suspense>
          } 
        />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
