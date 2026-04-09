import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Clock3,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { getRoleRoute } from '../utils/roleUtils';

const initialRegisterForm = {
  name: '',
  email: '',
  phone: '',
  password: ''
};

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = await login(email, password);
      navigate(getRoleRoute(userData.role));
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = await register(registerForm);
      navigate(getRoleRoute(userData.role));
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    {
      icon: Clock3,
      title: 'Transparent waiting',
      text: 'Customers can track their token progress instead of standing in uncertain lines.'
    },
    {
      icon: BriefcaseBusiness,
      title: 'Counter-ready workflow',
      text: 'Operators call, serve, and complete tokens through a clear queue lifecycle.'
    },
    {
      icon: Building2,
      title: 'Operational oversight',
      text: 'Managers and administrators see queue pressure, counters, and user activity in one place.'
    }
  ];

  const quickFacts = [
    { value: '4 roles', label: 'Customer to admin access' },
    { value: 'Live flow', label: 'Queue refresh across dashboards' },
    { value: 'Fast setup', label: 'New customers can register instantly' }
  ];

  return (
    <div className="app-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="glass-panel relative overflow-hidden rounded-[32px] border border-white/10 p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.14),transparent_34%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-200">
              <ShieldCheck className="h-4 w-4" />
              Queue Automation Platform
            </div>

            <div className="mt-8">
              <h1 className="max-w-3xl font-heading text-4xl leading-tight text-white sm:text-5xl">
                Smart queue management for banks, hospitals, colleges, and public service desks.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Sign in with an existing account or create a new customer account using any email ID.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <item.icon className="h-5 w-5 text-sky-300" />
                  <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {quickFacts.map((fact) => (
                <div key={fact.label} className="rounded-[24px] border border-white/10 bg-slate-950/45 px-5 py-4">
                  <div className="text-2xl font-semibold text-white">{fact.value}</div>
                  <div className="mt-1 text-sm text-slate-400">{fact.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-6 text-slate-300">
              A cleaner sign-in experience keeps the focus on secure access while new customers can still create an account in seconds.
            </div>
          </div>
        </section>

        <section className="glass-panel flex items-center rounded-[32px] border border-white/10 p-6 sm:p-8">
          <div className="w-full rounded-[28px] border border-white/10 bg-slate-950/35 p-5 sm:p-6">
            <div className="flex rounded-2xl border border-white/10 bg-slate-950/60 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`flex-1 rounded-[14px] px-4 py-2 text-sm font-semibold transition ${
                  mode === 'login' ? 'bg-sky-400 text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,0.18)]' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`flex-1 rounded-[14px] px-4 py-2 text-sm font-semibold transition ${
                  mode === 'register' ? 'bg-emerald-400 text-slate-950 shadow-[0_10px_30px_rgba(52,211,153,0.16)]' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                Create account
              </button>
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">Secure access</p>
            <h2 className="mt-3 font-heading text-3xl text-white">
              {mode === 'login' ? 'Sign in to your workspace' : 'Register a new customer account'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {mode === 'login'
                ? 'Use your registered email and password to access your dashboard.'
                : 'New sign-ups are created as customer accounts and can immediately access token generation.'}
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-slate-950"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-slate-950"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Signing in...' : 'Continue'}
                  {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Full name</label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm((current) => ({ ...current, name: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-slate-950"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((current) => ({ ...current, email: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-slate-950"
                    placeholder="Enter any valid email"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm((current) => ({ ...current, phone: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-slate-950"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm((current) => ({ ...current, password: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-slate-950"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Creating account...' : 'Create customer account'}
                  {!loading ? <UserPlus className="h-4 w-4" /> : null}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
