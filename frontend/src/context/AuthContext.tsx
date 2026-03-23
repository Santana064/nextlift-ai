import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { handleApiError } from '../components/ErrorHandler';
import { useToast } from '../hooks/useToast';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const clearError = () => setError(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        
        const { message } = handleApiError(error, showToast);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setError(null);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      showToast('success', 'Logged in successfully!');
    } catch (error: any) {
      const { message } = handleApiError(error, showToast);
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setError(null);
    
    // Validate input
    if (!email || !password || !name) {
      const msg = 'All fields are required';
      setError(msg);
      showToast('error', msg);
      throw new Error(msg);
    }
    
    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters';
      setError(msg);
      showToast('error', msg);
      throw new Error(msg);
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const msg = 'Please enter a valid email address';
      setError(msg);
      showToast('error', msg);
      throw new Error(msg);
    }

    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      showToast('success', 'Account created successfully!');
    } catch (error: any) {
      const { message } = handleApiError(error, showToast);
      setError(message);
      throw new Error(message);
    }
  };

  const demoLogin = async () => {
    setError(null);
    showToast('info', 'Logging in with demo account...');
    
    try {
      const response = await api.post('/auth/login', { 
        email: 'demo@nextlift.com', 
        password: 'demo123' 
      });
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      showToast('success', 'Logged in as demo user!');
    } catch (error: any) {
      // Try to create demo user if login fails
      try {
        showToast('info', 'Creating demo account...');
        
        const registerResponse = await api.post('/auth/register', {
          email: 'demo@nextlift.com',
          password: 'demo123',
          name: 'Demo User'
        });
        
        const { token: newToken, user: userData } = registerResponse.data;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        showToast('success', 'Demo account created and logged in!');
      } catch (registerError: any) {
        const { message } = handleApiError(registerError, showToast);
        setError(message);
        throw new Error(message);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
    showToast('info', 'Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      demoLogin, 
      logout, 
      isLoading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};


