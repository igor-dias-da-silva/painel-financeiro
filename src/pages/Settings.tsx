"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Upload, Palette, Bell, Shield, Loader2 } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoards, getTotalCards, Board, getProfile, updateProfile, Profile as SupabaseProfile } from '@/lib/database';
import { showError, showSuccess } from '@/utils/toast';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityColorPicker } from '@/components/PriorityColorPicker'; // Importar o novo componente

const defaultPriorityColors: Record<string, string> = {
  urgent: '#EF4444', // red-500
  high: '#F97316',   // orange-500
  medium: '#F59E0B',  // yellow-500
  low: '#3B82F6',    // blue-500
};

const priorityLabels: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa'
};

const Settings = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const userId = user?.id;

  const { data: profile, isLoading: profileLoading } = useQuery<SupabaseProfile | null>({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  });

  const { data: boards, isLoading: boardsLoading } = useQuery<Board[]>({
    queryKey: ['boards', userId],
    queryFn: () => getBoards(userId!),
    enabled: !!userId,
  });

  const { data: totalTasks, isLoading: tasksLoading } = useQuery<number>({
    queryKey: ['totalTasks', userId],
    queryFn: () => getTotalCards(userId!),
    enabled: !!userId,
  });

  const [notifications, setNotifications] = useState(true);
  const [defaultPriority, setDefaultPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [customPriorityColors, setCustomPriorityColors] = useState<Record<string, string>>(defaultPriorityColors);

  useEffect(() => {
    if (profile) {
      setDefaultPriority(profile.default_priority || 'medium');
      setCustomPriorityColors({ ...defaultPriorityColors, ...(profile.priority_colors || {}) });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<Omit<SupabaseProfile, 'id' | 'updated_at'>>) => updateProfile(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      showSuccess('Configurações atualizadas com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error);
      showError('Erro ao atualizar configurações. Tente novamente.');
    },
  });

  const handleDefaultPriorityChange = (value: 'low' | 'medium' | 'high' | 'urgent') => {
    setDefaultPriority(value);
    updateProfileMutation.mutate({ default_priority: value });
  };

  const handleSavePriorityColors = (newColors: Record<string, string>) => {
    setCustomPriorityColors(newColors);
    updateProfileMutation.mutate({ priority_colors: newColors });
  };

  const handleExportData = () => {
    if (!boards) {
      showError('Nenhum dado para exportar.');
      return;
    }
    const data = {
      boards,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Dados exportados com sucesso!');
  };

  const handleClearAllData = async () => {
    if (!user?.id) {
      showError('Usuário não autenticado.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir TODOS os seus quadros e tarefas? Esta ação não pode ser desfeita.')) {
      showError('A exclusão de todos os dados não está implementada via cliente. Por favor, entre em contato com o suporte.');
    }
  };

  const isLoading = authLoading || profileLoading || boardsLoading || tasksLoading || updateProfileMutation.isPending;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Configurações</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie suas preferências e dados do aplicativo</p>
          </div>

          <div className="space-y-6">
            {/* Aparência */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
                  <Palette className="h-5 w-5" />
                  <span>Aparência</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="dark:text-gray-200">Modo Escuro</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ative o tema escuro para melhor visualização noturna</p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="defaultPriority" className="dark:text-gray-200">Prioridade Padrão</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Define a prioridade padrão para novas tarefas</p>
                  </div>
                  <Select
                    value={defaultPriority}
                    onValueChange={handleDefaultPriorityChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[180px] dark:bg-input dark:text-foreground dark:border-border">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-card dark:border-border">
                      {Object.keys(priorityLabels).map((priority) => (
                        <SelectItem key={priority} value={priority} className="dark:text-foreground dark:hover:bg-accent">
                          {priorityLabels[priority]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <PriorityColorPicker
                  currentColors={customPriorityColors}
                  onSave={handleSavePriorityColors}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
                  <Bell className="h-5 w-5" />
                  <span>Notificações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="dark:text-gray-200">Notificações</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receba notificações sobre tarefas e atualizações</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dados e Backup */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
                  <Shield className="h-5 w-5" />
                  <span>Dados e Backup</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="dark:text-gray-200">Total de Quadros</Label>
                    <p className="text-2xl font-bold text-blue-600">{boards?.length || 0}</p>
                  </div>
                  <div>
                    <Label className="dark:text-gray-200">Total de Tarefas</Label>
                    <p className="text-2xl font-bold text-green-600">
                      {totalTasks || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleExportData} className="flex-1" disabled={isLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                  
                  <Button variant="outline" className="flex-1" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Dados (Indisponível)
                  </Button>
                </div>
                
                <div className="pt-4 border-t dark:border-gray-700">
                  <Button
                    variant="destructive"
                    onClick={handleClearAllData}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Todos os Dados
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
                    Esta ação excluirá permanentemente todos os seus quadros e tarefas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Settings;