"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Palette, Bell, Shield, Loader2 } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { showError, showSuccess } from '@/utils/toast';
import { deleteAllFinancialData } from '@/lib/data';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const Settings = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState(true);

  const deleteDataMutation = useMutation({
    mutationFn: () => deleteAllFinancialData(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyBudget'] });
      queryClient.invalidateQueries({ queryKey: ['shoppingItems'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      
      showSuccess('Todos os seus dados financeiros foram excluídos com sucesso.');
    },
    onError: (error) => {
      console.error('Erro ao excluir dados:', error);
      showError('Erro ao excluir dados. Tente novamente.');
    },
  });

  const handleClearAllData = async () => {
    if (!user?.id) {
      showError('Usuário não autenticado.');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir TODOS os seus dados financeiros? Esta ação não pode ser desfeita.')) {
      deleteDataMutation.mutate();
    }
  };

  const isLoading = authLoading || deleteDataMutation.isPending;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4 dark:bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-foreground mb-2">Configurações</h1>
            <p className="text-gray-600 dark:text-muted-foreground">Gerencie suas preferências e dados do aplicativo FinanBoard</p>
          </div>

          <div className="space-y-6">
            <Card className="dark:bg-card dark:border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-foreground">
                  <Palette className="h-5 w-5" />
                  <span>Aparência</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="dark:text-foreground">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">Ative o tema escuro para melhor visualização noturna</p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-card dark:border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-foreground">
                  <Bell className="h-5 w-5" />
                  <span>Notificações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="dark:text-foreground">Notificações</Label>
                    <p className="text-sm text-muted-foreground">Receba notificações sobre suas finanças</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-card dark:border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-foreground">
                  <Shield className="h-5 w-5" />
                  <span>Dados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="pt-4 border-t dark:border-border">
                  <Button
                    variant="destructive"
                    onClick={handleClearAllData}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {deleteDataMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Excluindo...</>
                    ) : (
                      'Excluir Todos os Dados'
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Esta ação excluirá permanentemente todos os seus dados financeiros.
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