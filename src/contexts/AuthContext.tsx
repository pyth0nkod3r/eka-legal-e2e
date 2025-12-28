import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check localStorage for persisted session
      const savedUser = localStorage.getItem('auth_user');
      const savedToken = localStorage.getItem('auth_token');
      
      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });
    
    if (response.success) {
      setUser(response.data.user);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      localStorage.setItem('auth_token', response.data.token);
      
      // Send login notification email (mocked)
      await api.email.sendLoginNotification(response.data.user.email, response.data.user.name);
      
      return { success: true };
    }
    
    return { success: false, message: response.message };
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const response = await api.auth.register({ name, email, password, phone });
    
    if (response.success) {
      setUser(response.data.user);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      localStorage.setItem('auth_token', response.data.token);
      
      // Send welcome email (mocked)
      await api.email.sendWelcomeEmail(response.data.user.email, response.data.user.name);
      
      return { success: true };
    }
    
    return { success: false, message: response.message };
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  const forgotPassword = async (email: string) => {
    const response = await api.auth.forgotPassword(email);
    
    if (response.success) {
      // Password reset email is sent by the API
      return { success: true, message: 'Password reset email sent' };
    }
    
    return { success: false, message: response.message };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
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
