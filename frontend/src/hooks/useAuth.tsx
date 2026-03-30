import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  guestId: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedIsGuest = sessionStorage.getItem('isGuest');
    const storedGuestId = sessionStorage.getItem('guestId');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsGuest(false);
    } else if (storedIsGuest === 'true' && storedGuestId) {
      setIsGuest(true);
      setGuestId(storedGuestId);
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    sessionStorage.removeItem('isGuest');
    sessionStorage.removeItem('guestId');
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsGuest(false);
    setGuestId(null);
  };

  const loginAsGuest = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const newGuestId = generateGuestId();
    sessionStorage.setItem('isGuest', 'true');
    sessionStorage.setItem('guestId', newGuestId);
    setToken(null);
    setUser(null);
    setIsGuest(true);
    setGuestId(newGuestId);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('isGuest');
    sessionStorage.removeItem('guestId');
    setToken(null);
    setUser(null);
    setIsGuest(false);
    setGuestId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token || isGuest,
        isGuest,
        guestId,
        isLoading,
        login,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
