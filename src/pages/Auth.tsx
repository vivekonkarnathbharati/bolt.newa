import { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, User, AtSign, Sun, Moon } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { useTheme } from '../lib/theme';

export function LoginPage() {
  const { signIn } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = signIn(email, password);
    setLoading(false);
    if (res.ok) navigate('/');
    else setError(res.error || 'Sign in failed.');
  };

  return (
    <AuthShell side="left">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center glow-accent">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-display font-extrabold text-2xl">socialHub</span>
        </div>
        <h2 className="font-display text-2xl font-extrabold mb-1">Welcome back</h2>
        <p className="text-[var(--text-muted)] mb-8">Sign in to continue to socialHub.</p>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-rose-500 bg-rose-500/10 px-3 py-2.5 rounded-xl">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <label className="block text-sm font-medium mb-1.5">Email</label>
        <div className="relative mb-4">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" />
        </div>

        <label className="block text-sm font-medium mb-1.5">Password</label>
        <div className="relative mb-6">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? 'Signing in…' : <>Sign in <ArrowRight size={18} /></>}
        </button>

        <div className="mt-5 p-3 rounded-xl bg-[var(--primary-soft)] text-xs text-[var(--primary)]">
          <p className="font-semibold mb-1">Try a demo account:</p>
          <p>alex@socialhub.demo · password</p>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/signup')} className="text-[var(--primary)] font-semibold hover:underline">Sign up</button>
        </p>
      </form>
    </AuthShell>
  );
}

export function SignupPage() {
  const { signUp } = useAuth();
  const { navigate } = useRouter();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = signUp(email, password, username, fullName);
    setLoading(false);
    if (res.ok) navigate('/');
    else setError(res.error || 'Sign up failed.');
  };

  return (
    <AuthShell side="right">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center glow-accent">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-display font-extrabold text-2xl">socialHub</span>
        </div>
        <h2 className="font-display text-2xl font-extrabold mb-1">Create your account</h2>
        <p className="text-[var(--text-muted)] mb-8">Join the conversation on socialHub.</p>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-rose-500 bg-rose-500/10 px-3 py-2.5 rounded-xl">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Username</label>
            <div className="relative">
              <AtSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input required value={username} onChange={(e) => setUsername(e.target.value)} className="input-field pl-10" placeholder="username" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Full name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field pl-10" placeholder="Your name" />
            </div>
          </div>
        </div>

        <label className="block text-sm font-medium mb-1.5">Email</label>
        <div className="relative mb-4">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" />
        </div>

        <label className="block text-sm font-medium mb-1.5">Password</label>
        <div className="relative mb-6">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? 'Creating account…' : <>Sign up <ArrowRight size={18} /></>}
        </button>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="text-[var(--primary)] font-semibold hover:underline">Sign in</button>
        </p>
      </form>
    </AuthShell>
  );
}

function AuthShell({ children, side }: { children: React.ReactNode; side: 'left' | 'right' }) {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[var(--bg)]">
      <button onClick={toggle} className="absolute top-4 right-4 z-10 p-2.5 rounded-full glass text-[var(--text)] hover:scale-110 transition" aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className={`hidden md:flex ${side === 'left' ? 'order-2' : 'order-1'} relative overflow-hidden bg-gradient-to-br from-accent via-indigo-500 to-pink-500`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <Sparkles size={48} className="mb-4 text-glow" />
          <h2 className="font-display text-3xl font-extrabold mb-3 text-glow">Share your world</h2>
          <p className="text-white/80 text-center max-w-xs">Posts, stories, reels, and messages — all in one beautiful place.</p>
        </div>
      </div>
      <div className={`flex items-center justify-center p-8 bg-[var(--bg)] ${side === 'left' ? 'order-1' : 'order-2'}`}>
        {children}
      </div>
    </div>
  );
}
