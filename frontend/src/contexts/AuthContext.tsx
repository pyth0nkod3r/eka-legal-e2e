import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import { api } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check localStorage for token
        const savedToken = localStorage.getItem("token");

        if (savedToken) {
          // Validate token by fetching current user
          const response = await api.auth.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        localStorage.removeItem("token");
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });

    if (response.success && response.data?.user) {
      setUser(response.data.user);
      // Token is automatically stored by authService.login
      return { success: true };
    }

    return { success: false, message: response.message };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => {
    const response = await api.auth.register({ name, email, password, phone });

    if (response.success && response.data?.user) {
      setUser(response.data.user);
      // Token is automatically stored by authService.register
      return { success: true };
    }

    return { success: false, message: response.message };
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    // Token is automatically removed by authService.logout
  };

  const forgotPassword = async (email: string) => {
    const response = await api.auth.forgotPassword(email);

    if (response.success) {
      return { success: true, message: "Password reset email sent" };
    }

    return { success: false, message: response.message };
  };

  const refreshUser = async () => {
    const response = await api.auth.getCurrentUser();
    if (response.success && response.data) {
      setUser(response.data);
    }
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
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
