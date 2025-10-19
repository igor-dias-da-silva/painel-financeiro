"use client";

import React, { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { DollarSign } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(location.pathname === '/login');

  useEffect(() => {
    setIsLoginMode(location.pathname === '/login');
  }, [location.pathname]);

  const toggleMode = () => {
    const newPath = isLoginMode ? '/register' : '/login';
    navigate(newPath);
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-[350px] space-y-6">
          {isLoginMode ? (
            <LoginForm onToggleMode={toggleMode} />
          ) : (
            <RegisterForm onToggleMode={toggleMode} />
          )}
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center p-10 flex-col text-center">
        <div className="flex items-center text-3xl font-bold mb-4">
          <DollarSign className="h-10 w-10 mr-2 text-primary" />
          <h1 className="text-4xl font-bold">FinanBoard</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-md">
          Assuma o controle total de suas finanças. De contas a pagar a listas de compras, simplificamos tudo para você.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;