"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Settings, BarChart2 } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>
      <p className="text-muted-foreground mb-8">Gerenciamento de usuários e visão geral do sistema.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20% este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Premium</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 5,970</div>
            <p className="text-xs text-muted-foreground">+15% este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Criadas</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,500</div>
            <p className="text-xs text-muted-foreground">Total de registros</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Usuários ativos semanalmente</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários (Em Breve)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta seção será usada para listar, editar e gerenciar todos os usuários do sistema.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;