"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthState } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { AuthApiError } from '@supabase/supabase-js';

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
          if (error instanceof AuthApiError && (error.status === 401 || error.status === 403)) {
            console.warn('Session expired, signing out.');
            await supabase.auth.signOut();
            setUser(null);
          } else {
            console.error('Error checking auth:', error);
          }
        } else if (user) {
          const userData: User = {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            email: user.email!,
            createdAt: user.created_at,
          };
          setUser(userData);
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        setUser(null);
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
          createdAt: session.user.created_at,
        };
        setUser(userData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      if (error instanceof AuthApiError) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha inválidos.');
        }
      }
      throw new Error('Ocorreu um erro ao fazer login.');
    }

    if (data.user) {
      const userData: User = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuário',
        email: data.user.email!,
        createdAt: data.user.created_at,
      };
      setUser(userData);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
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
      if (error instanceof AuthApiError) {
        if (error.message.includes('Password should be at least')) {
          throw new Error('A senha deve ter pelo menos 8 caracteres.');
        }
        if (error.message.includes('User already registered')) {
          throw new Error('Este e-mail já está em uso.');
        }
      }
      throw new Error('Ocorreu um erro ao criar a conta.');
    }

    if (!data.user) {
      throw new Error('Não foi possível criar o usuário.');
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