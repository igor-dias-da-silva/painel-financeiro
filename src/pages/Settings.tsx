"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Palette, Bell, Shield } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { showError } from '@/utils/toast';

const Settings = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState(true);

  const handleClearAllData = async () => {
    if (!user?.id) {
      showError('Usuário não autenticado.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir TODOS os seus dados financeiros? Esta ação não pode ser desfeita.')) {
      showError('A exclusão de todos os dados não está implementada. Por favor, entre em contato com o suporte.');
    }
  };

  const isLoading = authLoading;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Configurações</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie suas preferências e dados do aplicativo FinanBoard</p>
          </div>

          <div className="space-y-6">
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
              </CardContent>
            </Card>

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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receba notificações sobre suas finanças</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
                  <Shield className="h-5 w-5" />
                  <span>Dados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="pt-4 border-t dark:border-gray-700">
                  <Button
                    variant="destructive"
                    onClick={handleClearAllData}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Excluir Todos os Dados
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
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