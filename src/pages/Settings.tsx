"use client";

import React, { useState } from 'react';
import { Board } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Upload, Palette, Bell, Shield } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AuthGuard } from '@/components/AuthGuard';

const Settings = () => {
  const [boards] = useLocalStorage<Board[]>('kanban-boards', []);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [defaultPriority, setDefaultPriority] = useState('medium');

  const handleExportData = () => {
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
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.boards && Array.isArray(data.boards)) {
          localStorage.setItem('kanban-boards', JSON.stringify(data.boards));
          alert('Dados importados com sucesso!');
          window.location.reload();
        } else {
          alert('Formato de arquivo inválido!');
        }
      } catch (error) {
        alert('Erro ao importar dados!');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (confirm('Tem certeza que deseja excluir todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('kanban-boards');
      window.location.reload();
    }
  };

  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Configurações</h1>
            <p className="text-gray-600">Gerencie suas preferências e dados do aplicativo</p>
          </div>

          <div className="space-y-6">
            {/* Aparência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Aparência</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-gray-500">Ative o tema escuro para melhor visualização noturna</p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Prioridade Padrão</Label>
                    <p className="text-sm text-gray-500">Define a prioridade padrão para novas tarefas</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notificações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações</Label>
                    <p className="text-sm text-gray-500">Receba notificações sobre tarefas e atualizações</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-save</Label>
                    <p className="text-sm text-gray-500">Salva automaticamente suas alterações</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Dados e Backup</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Total de Quadros</Label>
                    <p className="text-2xl font-bold text-blue-600">{boards.length}</p>
                  </div>
                  <div>
                    <Label>Total de Tarefas</Label>
                    <p className="text-2xl font-bold text-green-600">
                      {boards.reduce((sum, board) => sum + board.tasks.length, 0)}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleExportData} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                  
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="import-data"
                    />
                    <Button variant="outline" className="w-full" asChild>
                      <label htmlFor="import-data" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Dados
                      </label>
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={handleClearAllData}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Todos os Dados
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Esta ação excluirá permanentemente todos os seus quadros e tarefas.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sobre */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Versão</Label>
                    <p className="text-gray-600">1.0.0</p>
                  </div>
                  <div>
                    <Label>Armazenamento</Label>
                    <p className="text-gray-600">Local Storage</p>
                  </div>
                  <div>
                    <Label>Tecnologias</Label>
                    <p className="text-gray-600">React, TypeScript, Tailwind CSS</p>
                  </div>
                  <div>
                    <Label>Desenvolvido por</Label>
                    <p className="text-gray-600">Dyad AI</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Este aplicativo é um gerenciador de tarefas Kanban completo que funciona 
                    diretamente no seu navegador, sem necessidade de servidor.
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