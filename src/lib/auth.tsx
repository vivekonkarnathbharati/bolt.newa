import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { db, type Profile } from './db';

type AuthCtx = {
  user: Profile | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (email: string, password: string, username: string, fullName?: string) => { ok: boolean; error?: string };
  signOut: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => setUser(db.getCurrentUser());

  useEffect(() => {
    setUser(db.getCurrentUser());
    setLoading(false);
  }, []);

  const signIn = (email: string, password: string) => {
    const res = db.signIn(email, password);
    if (res.ok) refresh();
    return res;
  };

  const signUp = (email: string, password: string, username: string, fullName?: string) => {
    const res = db.signUp(email, password, username, fullName);
    if (res.ok) refresh();
    return res;
  };

  const signOut = () => { db.signOut(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, profile: user, loading, signIn, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
