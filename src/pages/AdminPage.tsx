"use client";

import React from 'react';
import { AuthGuard } from '@/components/AuthGuard';

const AdminPage = () => {
  return (
    <AuthGuard>
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="mt-2 text-muted-foreground">Ferramentas de administração e gerenciamento de usuários.</p>
        {/* Conteúdo do Admin será implementado aqui */}
      </div>
    </AuthGuard>
  );
};

export default AdminPage;