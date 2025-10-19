"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Edit, Calendar, Crown, Zap } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, Profile as SupabaseProfile } from '@/lib/database';
import { showError, showSuccess } from '@/utils/toast';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { EditBioDialog } from '@/components/EditBioDialog';
import { EditNameDialog } from '@/components/EditNameDialog';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Profile = () => {
  const { user, isLoading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery<SupabaseProfile | null>({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showEditBioDialog, setShowEditBioDialog] = useState(false);
  const [showEditNameDialog, setShowEditNameDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBio(profile.bio || '');
    } else if (user) {
      const fullName = user.name.split(' ');
      setFirstName(fullName[0] || '');
      setLastName(fullName.slice(1).join(' ') || '');
      setBio('');
    }
  }, [profile, user]);

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<Omit<SupabaseProfile, 'id' | 'updated_at'>>) => updateProfile(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      showSuccess('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error);
      showError('Erro ao atualizar perfil. Tente novamente.');
    },
  });

  const handleSaveName = (newFirstName: string, newLastName: string) => {
    if (!userId) return;
    setFirstName(newFirstName);
    setLastName(newLastName);
    updateProfileMutation.mutate({ first_name: newFirstName, last_name: newLastName });
    setShowEditNameDialog(false);
  };

  const handleSaveBio = (newBio: string) => {
    if (!userId) return;
    setBio(newBio);
    updateProfileMutation.mutate({ bio: newBio });
    setShowEditBioDialog(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profileError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-background">
        <Card className="p-6 text-center dark:bg-card dark:border-border">
          <CardTitle className="text-red-600 mb-4 dark:text-red-400">Erro ao carregar perfil</CardTitle>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">Não foi possível carregar seus dados. Tente novamente mais tarde.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['profile', userId] })} className="mt-4">
              Recarregar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = `${firstName} ${lastName}`.trim() || user.name;
  const joinDate = user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy') : "N/A";

  const getPlanIcon = (plan?: string) => (plan === 'premium' ? <Crown className="h-5 w-5 text-yellow-500" /> : <Zap className="h-5 w-5 text-blue-500" />);
  const getPlanName = (plan?: string) => (plan === 'premium' ? 'Premium' : 'Gratuito');
  const planStatus = profile?.subscription_status === 'active' ? { text: 'Ativo', color: 'text-green-600' } : { text: 'Inativo', color: 'text-red-600' };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 dark:bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-foreground mb-1">Meu Perfil</h1>
            <p className="text-gray-600 dark:text-muted-foreground">Gerencie suas informações e preferências.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Coluna Esquerda: Resumo do Perfil */}
            <div className="lg:col-span-1">
              <Card className="dark:bg-card dark:border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarFallback className="text-3xl dark:bg-secondary dark:text-secondary-foreground">
                        {displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold dark:text-foreground">{displayName}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  
                  <div className="my-6 border-t -mx-6 dark:border-border" />

                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span>Membro desde {joinDate}</span>
                    </div>
                    <div className="flex items-center">
                      {getPlanIcon(profile?.subscription_plan)}
                      <span className="ml-3">Plano {getPlanName(profile?.subscription_plan)}</span>
                      <span className={`ml-auto font-semibold ${planStatus.color}`}>{planStatus.text}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/pricing" className="w-full">
                    <Button variant="outline" className="w-full dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent">
                      Gerenciar Plano
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* Coluna Direita: Detalhes e Segurança */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-foreground">Informações Pessoais</CardTitle>
                  <CardDescription>Atualize seus dados pessoais e biografia.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y dark:divide-border">
                    <li className="py-4 flex items-center justify-between">
                      <div>
                        <Label className="font-semibold dark:text-foreground">Nome Completo</Label>
                        <p className="text-muted-foreground text-sm">{displayName}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setShowEditNameDialog(true)} disabled={updateProfileMutation.isPending}>
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </Button>
                    </li>
                    <li className="py-4 flex items-start justify-between">
                      <div>
                        <Label className="font-semibold dark:text-foreground">Biografia</Label>
                        <p className="text-muted-foreground text-sm italic max-w-prose pt-1">
                          {bio || 'Nenhuma biografia definida.'}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setShowEditBioDialog(true)} disabled={updateProfileMutation.isPending} className="flex-shrink-0 ml-4">
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-foreground">Segurança</CardTitle>
                  <CardDescription>Gerencie sua senha e acesso à conta.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y dark:divide-border">
                    <li className="py-4 flex items-center justify-between">
                      <div>
                        <Label className="font-semibold dark:text-foreground">Senha</Label>
                        <p className="text-muted-foreground text-sm">************</p>
                      </div>
                      <Button variant="outline" onClick={() => setShowChangePasswordDialog(true)} className="dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent">
                        Alterar Senha
                      </Button>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="bg-red-50 dark:bg-destructive/10 p-4 border-t dark:border-destructive/20 rounded-b-lg">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <h4 className="font-semibold text-destructive dark:text-red-400">Sair da Conta</h4>
                      <p className="text-sm text-destructive/90 dark:text-red-400/90">Desconectar sua conta deste dispositivo.</p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>Sair</Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <ChangePasswordDialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog} />
      <EditBioDialog open={showEditBioDialog} onOpenChange={setShowEditBioDialog} currentBio={bio} onSave={handleSaveBio} isLoading={updateProfileMutation.isPending} />
      <EditNameDialog open={showEditNameDialog} onOpenChange={setShowEditNameDialog} currentFirstName={firstName} currentLastName={lastName} onSave={handleSaveName} isLoading={updateProfileMutation.isPending} />
    </AuthGuard>
  );
};

export default Profile;