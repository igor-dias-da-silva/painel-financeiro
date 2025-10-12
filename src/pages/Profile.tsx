"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Calendar, Clock, Award } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const Profile = () => {
  const [boards] = useLocalStorage<Board[]>('kanban-boards', []);
  const [userName, setUserName] = useState('Usuário Kanban');
  const [userEmail, setUserEmail] = useState('usuario@kanban.com');
  const [bio, setBio] = useState('Gerenciador de tarefas Kanban entusiasta');
  const [joinDate] = useState(new Date('2024-01-01').toLocaleDateString('pt-BR'));

  const calculateStats = () => {
    const totalTasks = boards.reduce((sum, board) => sum + board.tasks.length, 0);
    const completedTasks = boards.reduce((sum, board) => 
      sum + board.tasks.filter(task => task.columnId === 'done').length, 0
    );
    const totalBoards = boards.length;
    
    const tasksByPriority = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    boards.forEach(board => {
      board.tasks.forEach(task => {
        tasksByPriority[task.priority]++;
      });
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

  return (
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
                    <AvatarImage src="/placeholder.svg" alt="Avatar" />
                    <AvatarFallback className="text-2xl">
                      {userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{userName}</CardTitle>
                <p className="text-gray-600">{userEmail}</p>
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
                
                <div className="pt-4 border-t">
                  <Label>Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button className="flex-1">Salvar Alterações</Button>
                  <Button variant="outline">Editar Foto</Button>
                </div>
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
                  {boards.slice(0, 3).map(board => (
                    <div key={board.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{board.title}</div>
                        <div className="text-sm text-gray-600">
                          {board.tasks.length} tarefas • {board.columns.length} colunas
                        </div>
                      </div>
                      <Badge variant="outline">
                        {new Date(board.updatedAt).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  ))}
                  
                  {boards.length === 0 && (
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
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button>Salvar Alterações</Button>
                  <Button variant="outline">Alterar Senha</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;