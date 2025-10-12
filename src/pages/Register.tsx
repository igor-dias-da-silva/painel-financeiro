"use client";

import React, { useState } from 'react';
import { RegisterForm } from '@/components/RegisterForm';

const Register = () => {
  const [isLoginMode, setIsLoginMode] = useState(false);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLoginMode ? (
          <RegisterForm onToggleMode={toggleMode} />
        ) : (
          <RegisterForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
};

export default Register;