import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from './api';

const Auth = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [mode, setMode] = useState('auth');
  const [totp, setTotp] = useState('');
  const [challenge, setChallenge] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const navigate = useNavigate();

  const finish = (user) => {
    setUser(user);
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'forgot') {
        const res = await api.post('/api/auth/forgot-password', { email: formData.email });
        setInfo(res.data.message);
        setForgotSent(true);
        return;
      }
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await api.post(endpoint, formData);
      if (res.data.requires2fa) {
        setChallenge(res.data.challenge);
        setMode('2fa');
        return;
      }
      if (res.data.user) finish(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Request failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handle2fa = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/2fa/verify', { challenge, totp });
      finish(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-x-hidden">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md glass-panel p-6 sm:p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Quanterm Logo" className="h-16 w-auto object-contain rounded-xl mb-4" />
          <h2 className="text-2xl font-bold text-white text-center">
            {mode === 'forgot' ? 'Reset password' : mode === '2fa' ? 'Authenticator code' : isLogin ? 'Welcome back to Quanterm' : 'Create your account'}
          </h2>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}
        {info && <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">{info}</div>}

        {mode === '2fa' ? (
          <form onSubmit={handle2fa} className="space-y-4">
            <input className="glass-input text-center tracking-widest" maxLength={8} placeholder="000000" value={totp} onChange={(e) => setTotp(e.target.value)} />
            <button disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && mode === 'auth' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                <input type="text" placeholder="Full Name" required className="glass-input pl-10" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
              <input type="email" placeholder="Email Address" required className="glass-input pl-10" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            {mode === 'auth' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                <input type="password" placeholder="Password" required minLength={isLogin ? 1 : 8} className="glass-input pl-10" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            )}
            <button disabled={loading} className="w-full py-3 px-4 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'forgot' ? 'Send reset link' : isLogin ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        <div className="mt-6 text-center space-y-2">
          {mode === 'auth' && isLogin && (
            <button onClick={() => { setMode('forgot'); setForgotSent(false); }} className="block w-full text-sm text-textMuted hover:text-white">Forgot password?</button>
          )}
          {mode === 'forgot' && (
            <>
              {!forgotSent ? (
                <button onClick={() => { setMode('auth'); setForgotSent(false); }} className="text-sm text-textMuted hover:text-white">Back to sign in</button>
              ) : (
                <button onClick={() => { setMode('auth'); setForgotSent(false); setInfo(''); }} className="text-sm text-primary hover:underline">Back to sign in</button>
              )}
            </>
          )}
          {mode === 'auth' && (
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-textMuted hover:text-white">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          )}
          <p className="text-xs text-textMuted pt-2">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            {' · '}
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export const VerifyEmail = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('working');
  const [message, setMessage] = useState('Verifying…');
  const [resendEmail, setResendEmail] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  React.useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing token');
      return;
    }
    api.get('/api/auth/verify-email', { params: { token } })
      .then((res) => { setStatus('ok'); setMessage(res.data.message); })
      .catch((err) => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed'); });
  }, [params]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendLoading(true);
    setResendMsg('');
    try {
      const res = await api.post('/api/auth/resend-verification', { email: resendEmail });
      setResendMsg(res.data.message);
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Could not resend email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-8 max-w-md w-full text-center space-y-4">
        <p className={status === 'error' ? 'text-red-400' : 'text-white'}>{message}</p>
        {status === 'error' && (
          <form onSubmit={handleResend} className="space-y-3 text-left">
            <p className="text-xs text-textMuted">Enter your email to receive a new verification link.</p>
            <input type="email" required className="glass-input" placeholder="you@example.com" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} />
            <button disabled={resendLoading} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm">{resendLoading ? 'Sending…' : 'Resend verification email'}</button>
            {resendMsg && <p className="text-xs text-textMuted text-center">{resendMsg}</p>}
          </form>
        )}
        <Link to="/" className="text-primary text-sm inline-block">Continue</Link>
      </div>
    </div>
  );
};

export const ResetPassword = () => {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (password !== resetConfirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const res = await api.post('/api/auth/reset-password', { token: params.get('token'), password });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="glass-panel p-8 max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold text-white">Choose a new password</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-emerald-400 text-sm">{message}</p>}
        <input type="password" minLength={8} required className="glass-input" placeholder="New password (8+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" minLength={8} required className="glass-input" placeholder="Confirm new password" value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} />
        <button disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg">{loading ? 'Saving…' : 'Update password'}</button>
        <Link to="/" className="block text-center text-sm text-textMuted">Back to sign in</Link>
      </form>
    </div>
  );
};

export default Auth;
