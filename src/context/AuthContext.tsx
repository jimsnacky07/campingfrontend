import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import apiClient from '../api/client';
import { ENDPOINTS } from '../config/api';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback(async (jwt: string) => {
    await AsyncStorage.setItem('@token', jwt);
    setToken(jwt);
    const me = await apiClient.get<User>(ENDPOINTS.AUTH.ME);
    setUser(me.data);
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@token');
      if (storedToken) {
        await persistSession(storedToken);
      }
    } catch (error) {
      console.warn('Failed to restore session', error);
      await AsyncStorage.removeItem('@token');
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const response = await apiClient.post<{ token: string }>(
        ENDPOINTS.AUTH.LOGIN,
        payload,
      );
      await persistSession(response.data.token);
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload: Record<string, string>) => {
      const response = await apiClient.post<{ token: string }>(
        ENDPOINTS.AUTH.REGISTER,
        payload,
      );
      await persistSession(response.data.token);
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // ignore
    } finally {
      await AsyncStorage.removeItem('@token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      setUser,
    }),
    [loading, login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};


