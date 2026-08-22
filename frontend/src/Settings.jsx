import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Bell, Shield, Palette, Save, Eye, EyeOff,
  ChevronRight, Check, Moon, Sun, Monitor
} from 'lucide-react';

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'security',      label: 'Security',       icon: Shield },
  { id: 'appearance',    label: 'Appearance',     icon: Palette },
];

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
      checked ? 'bg-primary' : 'bg-white/10'
    }`}
  >
    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
      checked ? 'translate-x-5' : 'translate-x-0'
    }`} />
  </button>
);

const Field = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-white/80">{label}</label>
    {children}
    {hint && <p className="text-xs text-textMuted">{hint}</p>}
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-4 mt-6 first:mt-0">
    {children}
  </h3>
);

const SavedBadge = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-1 text-emerald-400 text-sm"
      >
        <Check className="w-4 h-4" /> Saved
      </motion.span>
    )}
  </AnimatePresence>
);

/* ─── tab panels ────────────────────────────────────────────────────────────── */
const ProfileTab = ({ userName, userEmail }) => {
  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('userName', name);
    // Dispatch a storage event so App.jsx re-reads the name
    window.dispatchEvent(new Event('userNameUpdated'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <SectionTitle>Account Information</SectionTitle>

      {/* Avatar */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
          {name ? name.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <p className="text-white font-medium">{name || 'Your Name'}</p>
          <p className="text-sm text-textMuted">{email || 'your@email.com'}</p>
          <button className="mt-1 text-xs text-primary hover:underline">Change avatar</button>
        </div>
      </div>

      <Field label="Full Name">
        <input
          className="glass-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your full name"
        />
      </Field>

      <Field label="Email Address" hint="Changing email requires verification.">
        <input
          className="glass-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Timezone">
        <select className="glass-input">
          <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
          <option value="America/New_York">America/New_York (EST)</option>
          <option value="Europe/London">Europe/London (GMT)</option>
          <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
        </select>
      </Field>

      <div className="flex items-center justify-between pt-2">
        <SavedBadge show={saved} />
        <button
          onClick={handleSave}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </div>
  );
};

const NotificationsTab = () => {
  const [prefs, setPrefs] = useState({
    priceAlerts:    true,
    portfolioDaily: true,
    newsDigest:     false,
    tradeConfirm:   true,
    riskWarnings:   true,
    weeklyReport:   false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = key => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Row = ({ id, label, desc }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-textMuted mt-0.5">{desc}</p>
      </div>
      <Toggle checked={prefs[id]} onChange={() => toggle(id)} />
    </div>
  );

  return (
    <div className="space-y-1">
      <SectionTitle>Market Alerts</SectionTitle>
      <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-1">
        <Row id="priceAlerts"    label="Price Alerts"         desc="Get notified when assets hit your target price" />
        <Row id="riskWarnings"   label="Risk Warnings"        desc="Portfolio risk threshold breaches" />
      </div>

      <SectionTitle>Portfolio Updates</SectionTitle>
      <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-1">
        <Row id="portfolioDaily" label="Daily Summary"        desc="End-of-day portfolio performance digest" />
        <Row id="weeklyReport"   label="Weekly Report"        desc="Comprehensive weekly analytics report" />
        <Row id="tradeConfirm"   label="Trade Confirmations"  desc="Notify when trades are executed" />
      </div>

      <SectionTitle>Content</SectionTitle>
      <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-1">
        <Row id="newsDigest"     label="Market News Digest"   desc="Curated financial news relevant to your portfolio" />
      </div>

      <div className="flex items-center justify-between pt-4">
        <SavedBadge show={saved} />
        <button
          onClick={handleSave}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </div>
    </div>
  );
};

const SecurityTab = () => {
  const [current, setCurrent] = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [confirm, setConfirm] = useState('');
  const [show,    setShow]    = useState(false);
  const [twoFA,   setTwoFA]   = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const handleSave = () => {
    if (newPwd && newPwd !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (newPwd && newPwd.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setSaved(true);
    setCurrent(''); setNewPwd(''); setConfirm('');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <SectionTitle>Change Password</SectionTitle>
      <div className="space-y-4 rounded-xl bg-white/5 border border-white/10 p-4">
        {['Current Password', 'New Password', 'Confirm New Password'].map((lbl, i) => {
          const val   = [current, newPwd, confirm][i];
          const setter = [setCurrent, setNewPwd, setConfirm][i];
          return (
            <Field key={lbl} label={lbl}>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="glass-input pr-10"
                  placeholder="••••••••"
                  value={val}
                  onChange={e => setter(e.target.value)}
                />
                <button
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-white"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          );
        })}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <SectionTitle>Two-Factor Authentication</SectionTitle>
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
        <div>
          <p className="text-sm font-medium text-white">Enable 2FA</p>
          <p className="text-xs text-textMuted mt-0.5">Add an extra layer of security to your account</p>
        </div>
        <Toggle checked={twoFA} onChange={setTwoFA} />
      </div>

      <SectionTitle>Active Sessions</SectionTitle>
      <div className="space-y-2">
        {[
          { device: 'Chrome on Windows', location: 'Mumbai, IN', current: true },
          { device: 'Safari on iPhone',  location: 'Delhi, IN',  current: false },
        ].map(s => (
          <div key={s.device} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-sm font-medium text-white">{s.device}</p>
              <p className="text-xs text-textMuted">{s.location} {s.current && '· This session'}</p>
            </div>
            {!s.current && (
              <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
            )}
            {s.current && (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <SavedBadge show={saved} />
        <button
          onClick={handleSave}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" /> Update Security
        </button>
      </div>
    </div>
  );
};

const AppearanceTab = () => {
  const [theme, setTheme]           = useState('dark');
  const [accent, setAccent]         = useState('#3B82F6');
  const [compactMode, setCompact]   = useState(false);
  const [animations, setAnimations] = useState(true);
  const [saved, setSaved]           = useState(false);

  const themes  = [
    { id: 'dark',   label: 'Dark',   icon: Moon },
    { id: 'light',  label: 'Light',  icon: Sun },
    { id: 'system', label: 'System', icon: Monitor },
  ];
  const accents = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <SectionTitle>Theme</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {themes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
              theme === id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-white/10 bg-white/5 text-textMuted hover:border-white/20 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      <SectionTitle>Accent Color</SectionTitle>
      <div className="flex gap-3 flex-wrap">
        {accents.map(color => (
          <button
            key={color}
            onClick={() => setAccent(color)}
            style={{ backgroundColor: color }}
            className={`w-9 h-9 rounded-full transition-transform duration-200 ${
              accent === color ? 'scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-black' : 'hover:scale-110'
            }`}
          />
        ))}
      </div>

      <SectionTitle>Display</SectionTitle>
      <div className="space-y-1 rounded-xl bg-white/5 border border-white/10 px-4 py-1">
        {[
          { id: 'compact', label: 'Compact Mode',        desc: 'Reduce padding for a denser layout', val: compactMode, set: setCompact },
          { id: 'anim',    label: 'Animations',          desc: 'Enable UI transitions and effects',  val: animations,  set: setAnimations },
        ].map(r => (
          <div key={r.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm font-medium text-white">{r.label}</p>
              <p className="text-xs text-textMuted mt-0.5">{r.desc}</p>
            </div>
            <Toggle checked={r.val} onChange={r.set} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <SavedBadge show={saved} />
        <button
          onClick={handleSave}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" /> Apply
        </button>
      </div>
    </div>
  );
};

/* ─── main drawer ───────────────────────────────────────────────────────────── */
const Settings = ({ isOpen, onClose, userName, userEmail }) => {
  const [activeTab, setActiveTab] = useState('profile');

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const panels = {
    profile:       <ProfileTab userName={userName} userEmail={userEmail} />,
    notifications: <NotificationsTab />,
    security:      <SecurityTab />,
    appearance:    <AppearanceTab />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#0d1220] border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-textMuted hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar tabs */}
              <nav className="w-44 border-r border-white/10 py-4 px-3 space-y-1 shrink-0">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-textMuted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>

              {/* Panel */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {panels[activeTab]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Settings;
