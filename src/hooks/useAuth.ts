"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthState } from '@/types/auth';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está logado ao carregar a página
    const checkAuth = () => {
      const storedUser = localStorage.getItem('kanban-user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('kanban-user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulação de login (em um app real, isso seria uma chamada à API)
      setTimeout(() => {
        if (email && password) {
          const userData: User = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email: email,
          };
          
          localStorage.setItem('kanban-user', JSON.stringify(userData));
          setUser(userData);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const register = (name: string, email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulação de registro
      setTimeout(() => {
        if (name && email && password) {
          const userData: User = {
            id: Date.now().toString(),
            name: name,
            email: email,
          };
          
          localStorage.setItem('kanban-user', JSON.stringify(userData));
          setUser(userData);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('kanban-user');
    setUser(null);
  };

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};