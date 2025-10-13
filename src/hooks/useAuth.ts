"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthState } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error checking auth:', error);
        } else if (user) {
          const userData: User = {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            email: user.email!,
          };
          setUser(userData);
        }
      } catch (error) {
        console.error('Error in auth check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email!,
        };
        setUser(userData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuário',
          email: data.user.email!,
        };
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        console.error('Register error:', error);
        return false;
      }

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          name: name,
          email: data.user.email!,
        };
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserPassword = async (newPassword: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error('Error updating password:', error);
        return false;
      }
      console.log('Password updated successfully:', data);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  };

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUserPassword,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};