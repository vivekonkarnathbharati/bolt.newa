import { LogOut, User, Palette, Bell, Shield, Info } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { Avatar } from '../components/Avatar';
import { useRouter } from '../lib/router';

export function SettingsPage() {
  const { profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { navigate } = useRouter();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <h1 className="font-display text-2xl font-extrabold mb-6">Settings</h1>

      <div className="card p-5 mb-5 flex items-center gap-4">
        <Avatar profile={profile} size={64} ring />
        <div className="min-w-0">
          <p className="font-display font-bold text-lg truncate">{profile?.full_name || profile?.username}</p>
          <p className="text-sm text-[var(--text-muted)] truncate">@{profile?.username}</p>
          <button onClick={() => navigate(`/profile/${profile?.id}`)} className="text-sm text-[var(--primary)] font-semibold mt-1 hover:underline">View profile</button>
        </div>
      </div>

      <Section title="Appearance" icon={<Palette size={18} />}>
        <Row label="Dark mode" desc="Switch between dark and light themes">
          <Toggle on={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        </Row>
        <Row label="Theme preview" desc="See the active accent color">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-indigo-500 glow-accent" />
            <span className="text-sm text-[var(--text-muted)]">{theme === 'dark' ? 'Dark · Cyan' : 'Light · Cyan'}</span>
          </div>
        </Row>
      </Section>

      <Section title="Notifications" icon={<Bell size={18} />}>
        <Row label="Push notifications" desc="Likes, comments, and new followers"><Toggle on onChange={() => {}} /></Row>
        <Row label="Direct messages" desc="New message alerts"><Toggle on onChange={() => {}} /></Row>
      </Section>

      <Section title="Privacy & Security" icon={<Shield size={18} />}>
        <Row label="Private account" desc="Only followers can see your posts"><Toggle on={false} onChange={() => {}} /></Row>
        <Row label="Activity status" desc="Show when you're active"><Toggle on onChange={() => {}} /></Row>
      </Section>

      <Section title="About" icon={<Info size={18} />}>
        <Row label="socialHub" desc="Version 2.0 · Frontend demo"><span className="text-xs text-[var(--text-muted)]">2026</span></Row>
      </Section>

      <Section title="Account" icon={<User size={18} />}>
        <button onClick={() => { signOut(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition">
          <LogOut size={18} /><span className="font-semibold text-sm">Sign out</span>
        </button>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card p-4 mb-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-[var(--primary)]">{icon}</span>
        <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--text-muted)]">{title}</h3>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-1">
      <div className="min-w-0">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`w-11 h-6 rounded-full transition-colors relative ${on ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  );
}
