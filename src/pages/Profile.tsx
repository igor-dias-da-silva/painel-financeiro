"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Edit, Calendar, Crown, Zap } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, Profile as SupabaseProfile } from '@/lib/database';
import { showError, showSuccess } from '@/utils/toast';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { EditBioDialog } from '@/components/EditBioDialog';
import { EditNameDialog } from '@/components/EditNameDialog';

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
    if (!userId) {
      showError('Usuário não autenticado.');
      return;
    }
    setFirstName(newFirstName);
    setLastName(newLastName);
    updateProfileMutation.mutate({ first_name: newFirstName, last_name: newLastName });
    setShowEditNameDialog(false);
  };

  const handleSaveBio = (newBio: string) => {
    if (!userId) {
      showError('Usuário não autenticado.');
      return;
    }
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-background">
        <Card className="p-6 text-center dark:bg-card dark:border-border">
          <CardTitle className="text-red-600 mb-4 dark:text-red-400">Erro ao carregar perfil</CardTitle>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">Não foi possível carregar seus dados de perfil. Tente novamente mais tarde.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['profile', userId] })} className="mt-4">
              Recarregar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = `${firstName} ${lastName}`.trim() || user?.name || 'Usuário';
  const joinDate = "N/A";

  const getPlanIcon = (plan: string) => {
    if (plan === 'premium') return <Crown className="h-5 w-5 text-yellow-500" />;
    return <Zap className="h-5 w-5 text-blue-500" />;
  };

  const getPlanName = (plan: string) => {
    if (plan === 'premium') return 'Premium';
    return 'Gratuito';
  };

  const getPlanStatus = (status: string) => {
    switch (status) {
      case 'active': return { text: 'Ativo', color: 'text-green-600' };
      case 'cancelled': return { text: 'Cancelado', color: 'text-red-600' };
      case 'past_due': return { text: 'Atrasado', color: 'text-yellow-600' };
      default: return { text: 'Desconhecido', color: 'text-gray-600' };
    }
  };

  const planStatus = getPlanStatus(profile?.subscription_status || 'active');
  const planName = getPlanName(profile?.subscription_plan || 'free');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4 dark:bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-foreground mb-2">Perfil</h1>
            <p className="text-gray-600 dark:text-muted-foreground">Gerencie suas informações pessoais e de conta</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="dark:bg-card dark:border-border">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl dark:bg-secondary dark:text-secondary-foreground">
                        {displayName.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl dark:text-foreground">{displayName}</CardTitle>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Membro desde {joinDate}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-secondary rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getPlanIcon(profile?.subscription_plan || 'free')}
                      <span className="font-medium dark:text-foreground">Plano</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold dark:text-foreground">{planName}</div>
                      <div className={`text-sm ${planStatus.color}`}>{planStatus.text}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-foreground">Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Adicionado campo de ID do Usuário para depuração */}
                  {userId && (
                    <div>
                      <Label htmlFor="userId" className="dark:text-foreground">ID do Usuário (Para Admin/Debug)</Label>
                      <Input
                        id="userId"
                        value={userId}
                        readOnly
                        className="mt-2 text-xs dark:bg-input dark:text-foreground dark:border-border"
                      />
                    </div>
                  )}
                  {/* Fim do campo de ID do Usuário */}
                  
                  <div>
                    <Label htmlFor="fullName" className="dark:text-foreground">Nome e Sobrenome</Label>
                    <div className="relative mt-2">
                      <Input
                        id="fullName"
                        value={displayName}
                        readOnly
                        className="dark:bg-input dark:text-foreground dark:border-border"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-0 right-0 h-full rounded-l-none dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent"
                        onClick={() => setShowEditNameDialog(true)}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio" className="dark:text-foreground">Bio</Label>
                    <div className="relative mt-2">
                      <Textarea
                        id="bio"
                        value={bio || 'Nenhuma biografia definida.'}
                        readOnly
                        className="dark:bg-input dark:text-foreground dark:border-border min-h-[80px]"
                        rows={3}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2 dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent"
                        onClick={() => setShowEditBioDialog(true)}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-foreground">Configurações de Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-3 pt-4 border-t dark:border-border">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowChangePasswordDialog(true)}
                      className="dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent"
                    >
                      Alterar Senha
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>Sair</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <ChangePasswordDialog
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
      />
      <EditBioDialog
        open={showEditBioDialog}
        onOpenChange={setShowEditBioDialog}
        currentBio={bio}
        onSave={handleSaveBio}
        isLoading={updateProfileMutation.isPending}
      />
      <EditNameDialog
        open={showEditNameDialog}
        onOpenChange={setShowEditNameDialog}
        currentFirstName={firstName}
        currentLastName={lastName}
        onSave={handleSaveName}
        isLoading={updateProfileMutation.isPending}
      />
    </AuthGuard>
  );
};

export default Profile;