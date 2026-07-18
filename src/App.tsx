import { AuthProvider, useAuth } from './lib/auth';
import { RouterProvider, useRouter } from './lib/router';
import { ThemeProvider } from './lib/theme';
import { LoginPage, SignupPage } from './pages/Auth';
import { HomePage } from './pages/Home';
import { ExplorePage } from './pages/Explore';
import { ProfilePage } from './pages/Profile';
import { ReelsPage } from './pages/Reels';
import { SettingsPage } from './pages/Settings';
import { MessagesPage } from './pages/Messages';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';

function Routes() {
  const { path } = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 size={28} className="animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!user) {
    if (path === '/signup') return <SignupPage />;
    return <LoginPage />;
  }

  let page: React.ReactNode;
  if (path === '/' || path === '') page = <HomePage />;
  else if (path === '/explore') page = <ExplorePage />;
  else if (path === '/reels') page = <ReelsPage />;
  else if (path === '/messages') page = <MessagesPage />;
  else if (path === '/settings') page = <SettingsPage />;
  else if (path.startsWith('/profile')) {
    const id = path.split('/')[2];
    page = <ProfilePage userId={id} />;
  } else page = <HomePage />;

  // Messages page is full-screen, skip the app shell
  if (path === '/messages') return <>{page}</>;

  return <Layout>{page}</Layout>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider>
          <Routes />
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
