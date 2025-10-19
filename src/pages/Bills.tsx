"use client";

import React from 'react';
import { AuthGuard } from '@/components/AuthGuard';

const Bills = () => {
  return (
    <AuthGuard>
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold">Contas a Pagar</h1>
        <p className="mt-2 text-muted-foreground">Visualize e gerencie suas contas fixas e recorrentes.</p>
        {/* Conteúdo das Contas a Pagar será implementado aqui */}
      </div>
    </AuthGuard>
  );
};

export default Bills;