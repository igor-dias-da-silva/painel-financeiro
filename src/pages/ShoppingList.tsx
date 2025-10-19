"use client";

import React from 'react';
import { AuthGuard } from '@/components/AuthGuard';

const ShoppingList = () => {
  return (
    <AuthGuard>
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold">Lista de Compras</h1>
        <p className="mt-2 text-muted-foreground">Gerencie seus itens de compra e orçamento mensal.</p>
        {/* Conteúdo da Lista de Compras será implementado aqui */}
      </div>
    </AuthGuard>
  );
};

export default ShoppingList;