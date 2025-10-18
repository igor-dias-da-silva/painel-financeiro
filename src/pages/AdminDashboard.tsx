"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Settings, BarChart2, Loader2, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProfiles, updateProfile, Profile } from '@/lib/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { showError, showSuccess } from '@/utils/toast';

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useQuery<Profile[]>({
    queryKey: ['allProfiles'],
    queryFn: getAllProfiles,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string, newRole: 'user' | 'admin' }) => 
      updateProfile(userId, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      showSuccess('Função do usuário atualizada com sucesso!');
    },
    onError: () => showError('Erro ao atualizar a função do usuário.'),
  });

  const handleToggleRole = (profile: Profile) => {
    const newRole = profile.role === 'admin' ? 'user' : 'admin';
    updateRoleMutation.mutate({ userId: profile.id, newRole });
  };

  if (profilesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profilesError) {
    return <div className="p-4 text-red-500">Erro ao carregar perfis: {profilesError.message}</div>;
  }

  const totalUsers = profiles?.length || 0;
  const adminUsers = profiles?.filter(p => p.role === 'admin').length || 0;
  const premiumUsers = profiles?.filter(p => p.subscription_plan === 'premium').length || 0;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 dark:text-foreground">Painel de Administração</h1>
      <p className="text-muted-foreground mb-8">Gerenciamento de usuários e visão geral do sistema.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-foreground">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Usuários registrados</p>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">Assinaturas Premium</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-foreground">{premiumUsers}</div>
            <p className="text-xs text-muted-foreground">Usuários com plano Premium</p>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">Administradores</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-foreground">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Usuários com acesso total</p>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">Engajamento</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-foreground">N/A</div>
            <p className="text-xs text-muted-foreground">Dados de atividade (mock)</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8 dark:bg-card dark:border-border">
        <CardHeader>
          <CardTitle className="dark:text-foreground">Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles?.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </TableCell>
                    <TableCell>{profile.id}</TableCell> {/* Usando ID como placeholder para email, pois o email não está na tabela profiles */}
                    <TableCell>
                      <Badge variant={profile.subscription_plan === 'premium' ? 'default' : 'outline'}>
                        {profile.subscription_plan || 'free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.role === 'admin' ? 'destructive' : 'secondary'}>
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant={profile.role === 'admin' ? 'outline' : 'default'} 
                        size="sm"
                        onClick={() => handleToggleRole(profile)}
                        disabled={updateRoleMutation.isPending}
                      >
                        {profile.role === 'admin' ? 'Rebaixar' : 'Promover a Admin'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;