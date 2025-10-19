"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Edit, Calendar, Crown, Zap, Mail } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 p-4 dark:bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-foreground mb-2">Meu Perfil</h1>
            <p className="text-gray-600 dark:text-muted-foreground">Gerencie suas informações e preferências.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Esquerda: Resumo do Perfil */}
            <div className="lg:col-span-1">
              <Card className="dark:bg-card dark:border-border">
                <CardContent className="p-6 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarFallback className="text-3xl dark:bg-secondary dark:text-secondary-foreground">
                      {displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold dark:text-foreground">{displayName}</h2>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" /> {user.email}
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-2">
                    <Calendar className="h-4 w-4" />
                    <span>Membro desde {joinDate}</span>
                  </div>
                  <div className="my-6 border-t border-border" />
                  <div className="space-y-4 text-left">
                    <h3 className="font-semibold text-center dark:text-foreground">Seu Plano Atual</h3>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-secondary rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(profile?.subscription_plan)}
                        <span className="font-medium dark:text-foreground">Plano</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold dark:text-foreground">{getPlanName(profile?.subscription_plan)}</div>
                        <div className={`text-sm ${planStatus.color}`}>{planStatus.text}</div>
                      </div>
                    </div>
                    <Link to="/pricing" className="w-full">
                      <Button variant="outline" className="w-full dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent">
                        Mudar de Plano
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita: Detalhes e Segurança */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-foreground">Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="dark:text-foreground">Nome Completo</Label>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-muted-foreground">{displayName}</p>
                      <Button variant="ghost" size="sm" onClick={() => setShowEditNameDialog(true)} disabled={updateProfileMutation.isPending}>
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </Button>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <Label className="dark:text-foreground">Biografia</Label>
                    <div className="flex items-start justify-between mt-1">
                      <p className="text-muted-foreground italic max-w-prose">
                        {bio || 'Nenhuma biografia definida.'}
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => setShowEditBioDialog(true)} disabled={updateProfileMutation.isPending}>
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-foreground">Segurança e Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg dark:border-border">
                    <div>
                      <h4 className="font-medium dark:text-foreground">Alterar Senha</h4>
                      <p className="text-sm text-muted-foreground">Recomendamos atualizar sua senha periodicamente.</p>
                    </div>
                    <Button variant="outline" onClick={() => setShowChangePasswordDialog(true)} className="dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent">
                      Alterar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-destructive/50 bg-destructive/10 rounded-lg dark:bg-destructive/20 dark:border-destructive/30">
                    <div>
                      <h4 className="font-medium text-destructive dark:text-red-400">Sair da Conta</h4>
                      <p className="text-sm text-destructive/80 dark:text-red-400/80">Desconectar sua conta deste dispositivo.</p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>Sair</Button>
                  </div>
                </CardContent>
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