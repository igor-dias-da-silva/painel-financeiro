"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // AvatarImage removido
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { User, Calendar, Clock, Award, Loader2 } from 'lucide-react'; // Mail removido
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, getTotalCards, getBoards, Profile as SupabaseProfile, Board, Card as SupabaseCard } from '@/lib/database';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

const Profile = () => {
  const { user, isLoading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();

  const userId = user?.id;

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery<SupabaseProfile | null>({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  });

  const { data: boards, isLoading: boardsLoading } = useQuery<Board[]>({
    queryKey: ['boards', userId],
    queryFn: () => getBoards(userId!),
    enabled: !!userId,
  });

  const { data: totalTasksCount, isLoading: tasksCountLoading } = useQuery<number>({
    queryKey: ['totalTasks', userId],
    queryFn: () => getTotalCards(userId!),
    enabled: !!userId,
  });

  const { data: allCards, isLoading: cardsLoading } = useQuery<SupabaseCard[]>({
    queryKey: ['allCards', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId!);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState(''); // Bio is not directly in Supabase profile, keeping it local for now

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    } else if (user) {
      const fullName = user.name.split(' ');
      setFirstName(fullName[0] || '');
      setLastName(fullName.slice(1).join(' ') || '');
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      showError('Usuário não autenticado.');
      return;
    }
    updateProfileMutation.mutate({ first_name: firstName, last_name: lastName });
  };

  const handleLogout = async () => {
    await logout();
  };

  const calculateStats = () => {
    const totalTasks = totalTasksCount || 0;
    const completedTasks = allCards?.filter(card => card.column_id === 'done').length || 0; // Assuming 'done' is a column ID
    const totalBoards = boards?.length || 0; // Use boards from useQuery
    
    const tasksByPriority = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    allCards?.forEach(card => {
      if (card.priority) {
        tasksByPriority[card.priority]++;
      }
    });

    return {
      totalTasks,
      completedTasks,
      totalBoards,
      tasksByPriority,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const stats = calculateStats();

  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  };

  const priorityLabels = {
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa'
  };

  const isLoading = authLoading || profileLoading || boardsLoading || tasksCountLoading || cardsLoading;

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
  // Use a placeholder for joinDate as `user.created_at` is not available on the `User` type from useAuth
  const joinDate = "N/A"; 

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4 dark:bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-foreground mb-2">Perfil</h1>
            <p className="text-gray-600 dark:text-muted-foreground">Gerencie suas informações pessoais e estatísticas</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Pessoais */}
            <div className="lg:col-span-1">
              <Card className="dark:bg-card dark:border-border">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      {/* AvatarImage removido */}
                      <AvatarFallback className="text-2xl dark:bg-secondary dark:text-secondary-foreground">
                        {displayName.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl dark:text-foreground">{displayName}</CardTitle>
                  {/* Email removido */}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Membro desde {joinDate}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>{stats.totalBoards} quadros criados</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{stats.totalTasks} tarefas criadas</span>
                  </div>
                  
                  <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t dark:border-border">
                    <div>
                      <Label htmlFor="firstName" className="dark:text-foreground">Primeiro Nome</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-2 dark:bg-input dark:text-foreground dark:border-border"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="dark:text-foreground">Sobrenome</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-2 dark:bg-input dark:text-foreground dark:border-border"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="dark:text-foreground">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Conte um pouco sobre você..."
                        className="mt-2 dark:bg-input dark:text-foreground dark:border-border"
                        rows={3}
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button type="submit" className="flex-1" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                      {/* Botão "Editar Foto" removido */}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas e Detalhes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Estatísticas Gerais */}
              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-foreground">Estatísticas de Atividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalBoards}</div>
                      <div className="text-sm text-gray-600 dark:text-muted-foreground">Quadros</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.totalTasks}</div>
                      <div className="text-sm text-gray-600 dark:text-muted-foreground">Tarefas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.completedTasks}</div>
                      <div className="text-sm text-gray-600 dark:text-muted-foreground">Concluídas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.completionRate}%</div>
                      <div className="text-sm text-gray-600 dark:text-muted-foreground">Taxa</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prioridades Mais Usadas */}
              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-foreground">Prioridades Mais Usadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.tasksByPriority).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`}></div>
                          <span className="text-sm font-medium dark:text-foreground">{priorityLabels[priority as keyof typeof priorityLabels]}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold dark:text-foreground">{count}</span>
                          <span className="text-sm text-gray-500 dark:text-muted-foreground">tarefas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Atividade Recente */}
              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-foreground">Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Fetching recent boards for display */}
                    {boards?.slice(0, 3).map(board => (
                      <div key={board.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-secondary dark:border-border">
                        <div>
                          <div className="font-medium dark:text-foreground">{board.title}</div>
                          <div className="text-sm text-gray-600 dark:text-muted-foreground">
                            {/* Placeholder for tasks/columns count, will fetch from Supabase later */}
                            ... tarefas • ... colunas
                          </div>
                        </div>
                        <Badge variant="outline" className="dark:bg-accent dark:text-accent-foreground dark:border-border">
                          {new Date(board.updated_at).toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>
                    ))}
                    
                    {(boards?.length === 0 || !boards) && (
                      <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                        Nenhuma atividade recente
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Conta */}
              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-foreground">Configurações de Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email input removido */}
                  
                  <div className="flex space-x-3 pt-4 border-t dark:border-border">
                    <Button variant="outline" disabled className="dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent">Alterar Senha</Button> {/* Placeholder */}
                    <Button variant="destructive" onClick={handleLogout}>Sair</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Profile;