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
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useQuery<Profile[]>({
    queryKey: ['allProfiles'],
    queryFn: getAllProfiles,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string, newRole: 'user' | 'admin' }) => {
      const updates: Partial<Profile> = { role: newRole };
      if (newRole === 'admin') {
        updates.subscription_plan = 'premium';
        updates.subscription_status = 'active';
        updates.subscription_ends_at = null; // Admin premium não expira
      } else {
        // Ao rebaixar, volta para o plano gratuito
        updates.subscription_plan = 'free';
        updates.subscription_status = 'active';
        updates.subscription_ends_at = null;
      }
      return updateProfile(userId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      showSuccess('Função e plano do usuário atualizados com sucesso!');
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
      <h1 className="text-3xl font-bold mb-6 dark:text-foreground">{t('admin.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('admin.description')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">{t('admin.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-foreground">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">{t('admin.registeredUsers')}</p>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">{t('admin.premiumSubs')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-foreground">{premiumUsers}</div>
            <p className="text-xs text-muted-foreground">{t('admin.premiumUsers')}</p>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">{t('admin.admins')}</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-foreground">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">{t('admin.totalAccessUsers')}</p>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-card dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-foreground">{t('admin.engagement')}</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-foreground">N/A</div>
            <p className="text-xs text-muted-foreground">{t('admin.mockActivityData')}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8 dark:bg-card dark:border-border">
        <CardHeader>
          <CardTitle className="dark:text-foreground">{t('admin.userManagement')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.name')}</TableHead>
                  <TableHead>{t('admin.userId')}</TableHead>
                  <TableHead>{t('admin.plan')}</TableHead>
                  <TableHead>{t('admin.role')}</TableHead>
                  <TableHead className="text-right">{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles?.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{profile.id}</TableCell>
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
                        {profile.role === 'admin' ? t('admin.demote') : t('admin.promote')}
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