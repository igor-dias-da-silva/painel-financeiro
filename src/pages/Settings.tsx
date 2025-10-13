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
import { useQuery } from '@tanstack/react-query';
import { getBoards, getTotalCards, Board } from '@/lib/database';
import { showError, showSuccess } from '@/utils/toast';
import { useTheme } from 'next-themes'; // Importar useTheme

const Settings = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme(); // Usar o hook useTheme
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [defaultPriority, setDefaultPriority] = useState('medium');

  const userId = user?.id;

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

  // Sincronizar o estado do Switch com o tema atual
  useEffect(() => {
    if (theme === 'dark') {
      // setDarkMode(true); // Não precisamos mais de um estado local para darkMode
    } else {
      // setDarkMode(false);
    }
  }, [theme]);

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

  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  };

  if (authLoading || boardsLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900"> {/* Adicionado dark:bg-gray-900 */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Configurações</h1> {/* Adicionado dark:text-gray-100 */}
            <p className="text-gray-600 dark:text-gray-400">Gerencie suas preferências e dados do aplicativo</p> {/* Adicionado dark:text-gray-400 */}
          </div>

          <div className="space-y-6">
            {/* Aparência */}
            <Card className="dark:bg-gray-800 dark:border-gray-700"> {/* Adicionado dark classes */}
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-gray-100"> {/* Adicionado dark:text-gray-100 */}
                  <Palette className="h-5 w-5" />
                  <span>Aparência</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="dark:text-gray-200">Modo Escuro</Label> {/* Adicionado dark:text-gray-200 */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ative o tema escuro para melhor visualização noturna</p> {/* Adicionado dark:text-gray-400 */}
                  </div>
                  <Switch
                    checked={theme === 'dark'} // Usar o tema de next-themes
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} // Alternar tema
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="dark:text-gray-200">Prioridade Padrão</Label> {/* Adicionado dark:text-gray-200 */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">Define a prioridade padrão para novas tarefas</p> {/* Adicionado dark:text-gray-400 */}
                  </div>
                  <div className="flex space-x-2">
                    {Object.entries(priorityColors).map(([priority, color]) => (
                      <Badge
                        key={priority}
                        variant={defaultPriority === priority ? "default" : "outline"}
                        className={`${color} text-white cursor-pointer`}
                        onClick={() => setDefaultPriority(priority)}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card className="dark:bg-gray-800 dark:border-gray-700"> {/* Adicionado dark classes */}
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-gray-100"> {/* Adicionado dark:text-gray-100 */}
                  <Bell className="h-5 w-5" />
                  <span>Notificações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="dark:text-gray-200">Notificações</Label> {/* Adicionado dark:text-gray-200 */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receba notificações sobre tarefas e atualizações</p> {/* Adicionado dark:text-gray-400 */}
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="dark:text-gray-200">Auto-save</Label> {/* Adicionado dark:text-gray-200 */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">Salva automaticamente suas alterações</p> {/* Adicionado dark:text-gray-400 */}
                  </div>
                  <Switch
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dados e Backup */}
            <Card className="dark:bg-gray-800 dark:border-gray-700"> {/* Adicionado dark classes */}
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-gray-100"> {/* Adicionado dark:text-gray-100 */}
                  <Shield className="h-5 w-5" />
                  <span>Dados e Backup</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="dark:text-gray-200">Total de Quadros</Label> {/* Adicionado dark:text-gray-200 */}
                    <p className="text-2xl font-bold text-blue-600">{boards?.length || 0}</p>
                  </div>
                  <div>
                    <Label className="dark:text-gray-200">Total de Tarefas</Label> {/* Adicionado dark:text-gray-200 */}
                    <p className="text-2xl font-bold text-green-600">
                      {totalTasks || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleExportData} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                  
                  <Button variant="outline" className="flex-1" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Dados (Indisponível)
                  </Button>
                </div>
                
                <div className="pt-4 border-t dark:border-gray-700"> {/* Adicionado dark:border-gray-700 */}
                  <Button
                    variant="destructive"
                    onClick={handleClearAllData}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Todos os Dados
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 dark:text-gray-400"> {/* Adicionado dark:text-gray-400 */}
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