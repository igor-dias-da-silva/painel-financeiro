"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Bell, Shield, Loader2, Languages } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { showError, showSuccess } from '@/utils/toast';
import { deleteAllFinancialData } from '@/lib/data';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const Settings = () => {
  const { t, i18n } = useTranslation();
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-foreground mb-2">{t('settings.title')}</h1>
            <p className="text-gray-600 dark:text-muted-foreground">{t('settings.description')}</p>
          </div>

          <div className="space-y-6">
            <Card className="dark:bg-card dark:border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-foreground">
                  <Languages className="h-5 w-5" />
                  <span>{t('settings.language')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t('settings.languageDescription')}</p>
                <Select value={i18n.language} onValueChange={(lang) => i18n.changeLanguage(lang)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">{t('languages.pt')}</SelectItem>
                    <SelectItem value="en">{t('languages.en')}</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="dark:bg-card dark:border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-foreground">
                  <Palette className="h-5 w-5" />
                  <span>{t('settings.appearance')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="dark:text-foreground">{t('settings.darkMode')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.darkModeDescription')}</p>
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
                  <span>{t('settings.notifications')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="dark:text-foreground">{t('settings.notificationsToggle')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.notificationsDescription')}</p>
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
                  <span>{t('settings.data')}</span>
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
                      t('settings.deleteAllData')
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('settings.deleteAllDataDescription')}
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