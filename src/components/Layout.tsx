import { useState, type ReactNode } from 'react';
import { Home, Compass, Plus, Film, User as UserIcon, Send, Moon, Sun, Settings } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { Link, useRouter } from '../lib/router';
import { Avatar } from './Avatar';
import { DirectMessages } from './DirectMessages';
import { CreatePostModal } from './CreatePostModal';

export function Layout({ children }: { children: ReactNode }) {
  const { profile, user } = useAuth();
  const { theme, toggle } = useTheme();
  const { path, navigate } = useRouter();
  const [dmOpen, setDmOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const isActive = (match: RegExp | string) =>
    typeof match === 'string' ? path === match : match.test(path);

  const navItems = [
    { to: '/', label: 'Home', Icon: Home, match: /^\/$/ },
    { to: '/explore', label: 'Explore', Icon: Compass, match: /^\/explore/ },
    { to: '/reels', label: 'Reels', Icon: Film, match: /^\/reels/ },
    { to: `/profile/${user?.id}`, label: 'Profile', Icon: UserIcon, match: /^\/profile/ },
  ];

  const sidebarItem = (item: (typeof navItems)[number]) => {
    const active = isActive(item.match);
    return (
      <button
        key={item.to}
        onClick={() => navigate(item.to)}
        className={`group flex items-center gap-4 w-full px-3 py-3 rounded-2xl transition-all ${
          active ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'text-[var(--text)] hover:bg-[var(--surface-2)]'
        }`}
      >
        <item.Icon size={24} className={active ? 'text-[var(--primary)]' : 'group-hover:scale-110 transition-transform'} fill={active && item.label === 'Home' ? 'currentColor' : 'none'} />
        <span className="font-semibold text-[15px] hidden lg:block">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-[72px] lg:w-64 shrink-0 sticky top-0 h-screen px-2 lg:px-3 py-5 border-r border-[var(--border)] bg-[var(--surface)]">
        <Link to="/" className="flex items-center gap-2 px-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center glow-accent shrink-0">
            <Film size={20} className="text-white" />
          </div>
          <span className="font-display font-extrabold text-xl hidden lg:block">socialHub</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map(sidebarItem)}
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-4 w-full px-3 py-3 rounded-2xl text-[var(--text)] hover:bg-[var(--surface-2)] transition-all">
            <Plus size={24} />
            <span className="font-semibold text-[15px] hidden lg:block">Create</span>
          </button>
          <button onClick={() => setDmOpen(true)} className="flex items-center gap-4 w-full px-3 py-3 rounded-2xl text-[var(--text)] hover:bg-[var(--surface-2)] transition-all">
            <Send size={22} />
            <span className="font-semibold text-[15px] hidden lg:block">Messages</span>
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          <button onClick={toggle} className="flex items-center gap-4 w-full px-3 py-3 rounded-2xl text-[var(--text)] hover:bg-[var(--surface-2)] transition-all">
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            <span className="font-semibold text-[15px] hidden lg:block">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <Link to="/settings" className={`flex items-center gap-4 w-full px-3 py-3 rounded-2xl transition-all ${isActive('/settings') ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'hover:bg-[var(--surface-2)]'}`}>
            <Settings size={22} />
            <span className="font-semibold text-[15px] hidden lg:block">Settings</span>
          </Link>
          <Link to={`/profile/${user?.id}`} className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-[var(--surface-2)] transition">
            <Avatar profile={profile} size={32} />
            <div className="min-w-0 hidden lg:block">
              <p className="font-semibold text-sm truncate">{profile?.full_name || profile?.username}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">@{profile?.username}</p>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0">
        <header className="md:hidden glass sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center glow-accent">
              <Film size={16} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-lg">socialHub</span>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={toggle} className="p-2 rounded-full hover:bg-[var(--surface-2)]">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setDmOpen(true)} className="p-2 rounded-full hover:bg-[var(--surface-2)]">
              <Send size={20} />
            </button>
          </div>
        </header>

        {children}
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-[var(--border)]">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 2).map((item) => {
            const active = isActive(item.match);
            return (
              <button key={item.to} onClick={() => navigate(item.to)} className="p-2 rounded-xl">
                <item.Icon size={24} className={active ? 'text-[var(--primary)]' : 'text-[var(--text)]'} fill={active && item.label === 'Home' ? 'currentColor' : 'none'} />
              </button>
            );
          })}
          <button onClick={() => setCreateOpen(true)} className="p-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
          </button>
          <button onClick={() => navigate('/reels')} className="p-2 rounded-xl">
            <Film size={24} className={isActive(/^\/reels/) ? 'text-[var(--primary)]' : 'text-[var(--text)]'} />
          </button>
          <button onClick={() => navigate(`/profile/${user?.id}`)} className="p-1 rounded-full">
            <Avatar profile={profile} size={28} ring={isActive(/^\/profile/)} />
          </button>
        </div>
      </nav>

      {dmOpen && <DirectMessages onClose={() => setDmOpen(false)} />}
      {createOpen && <CreatePostModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
