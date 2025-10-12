"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Calendar, Clock, Award, Loader2 } from 'lucide-react';
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setAvatarUrl(profile.avatar_url || null);
    } else if (user) {
      const fullName = user.name.split(' ');
      setFirstName(fullName[0] || '');
      setLastName(fullName.slice(1).join(' ') || '');
      setAvatarUrl(user.avatar || null);
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
    updateProfileMutation.mutate({ first_name: firstName, last_name: lastName, avatar_url: avatarUrl });
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <CardTitle className="text-red-600 mb-4">Erro ao carregar perfil</CardTitle>
          <CardContent>
            <p className="text-gray-600">Não foi possível carregar seus dados de perfil. Tente novamente mais tarde.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['profile', userId] })} className="mt-4">
              Recarregar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = `${firstName} ${lastName}`.trim() || user?.email?.split('@')[0] || 'Usuário';
  const displayEmail = user?.email || 'N/A';
  // Use a placeholder for joinDate as `user.created_at` is not available on the `User` type from useAuth
  const joinDate = "N/A"; 

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais e estatísticas</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Pessoais */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Avatar" />
                      <AvatarFallback className="text-2xl">
                        {displayName.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{displayName}</CardTitle>
                  <p className="text-gray-600">{displayEmail}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Membro desde {joinDate}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>{stats.totalBoards} quadros criados</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{stats.totalTasks} tarefas criadas</span>
                  </div>
                  
                  <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="firstName">Primeiro Nome</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-2"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-2"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Conte um pouco sobre você..."
                        className="mt-2"
                        rows={3}
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button type="submit" className="flex-1" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                      <Button variant="outline" disabled>Editar Foto</Button> {/* Placeholder for avatar upload */}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas e Detalhes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Estatísticas Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Atividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalBoards}</div>
                      <div className="text-sm text-gray-600">Quadros</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.totalTasks}</div>
                      <div className="text-sm text-gray-600">Tarefas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.completedTasks}</div>
                      <div className="text-sm text-gray-600">Concluídas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.completionRate}%</div>
                      <div className="text-sm text-gray-600">Taxa</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prioridades Mais Usadas */}
              <Card>
                <CardHeader>
                  <CardTitle>Prioridades Mais Usadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.tasksByPriority).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`}></div>
                          <span className="text-sm font-medium">{priorityLabels[priority as keyof typeof priorityLabels]}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold">{count}</span>
                          <span className="text-sm text-gray-500">tarefas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Atividade Recente */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Fetching recent boards for display */}
                    {boards?.slice(0, 3).map(board => (
                      <div key={board.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{board.title}</div>
                          <div className="text-sm text-gray-600">
                            {/* Placeholder for tasks/columns count, will fetch from Supabase later */}
                            ... tarefas • ... colunas
                          </div>
                        </div>
                        <Badge variant="outline">
                          {new Date(board.updated_at).toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>
                    ))}
                    
                    {(boards?.length === 0 || !boards) && (
                      <div className="text-center py-8 text-gray-500">
                        Nenhuma atividade recente
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Conta */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={displayEmail}
                      className="mt-1"
                      disabled
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button variant="outline" disabled>Alterar Senha</Button> {/* Placeholder */}
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