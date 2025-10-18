"use client";

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAdmin, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    // Redireciona para o dashboard se não for admin
    return (
      <div className="min-h-screen flex items-center justify-center p-4 dark:bg-background">
        <Card className="w-full max-w-md text-center dark:bg-card dark:border-border">
          <CardHeader>
            <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-2xl text-red-500">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <Navigate to="/dashboard" replace />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};