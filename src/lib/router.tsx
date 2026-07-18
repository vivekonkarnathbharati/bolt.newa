import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type RouterCtx = { path: string; navigate: (to: string) => void };
const RouterContext = createContext<RouterCtx>({ path: '/', navigate: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => {
    try { return window.location.pathname || '/'; } catch { return '/'; }
  });

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    try { window.history.pushState({}, '', to); } catch { /* ignore */ }
    setPath(to);
    try { window.scrollTo(0, 0); } catch { /* ignore */ }
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() { return useContext(RouterContext); }

export function Link({
  to,
  children,
  className,
  onClick,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => { e.preventDefault(); navigate(to); onClick?.(); }}
      className={className}
    >
      {children}
    </a>
  );
}
