"use client";

import React, { useState, useEffect } from 'react';
import { Board, Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const Dashboard = () => {
  const [boards] = useLocalStorage<Board[]>('kanban-boards', []);

  const calculateStats = () => {
    const totalTasks = boards.reduce((sum, board) => sum + board.tasks.length, 0);
    const totalBoards = boards.length;
    
    const tasksByPriority = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    const tasksByStatus = {
      todo: 0,
      inProgress: 0,
      done: 0
    };

    let overdueTasks = 0;
    let completedTasks = 0;

    boards.forEach(board => {
      board.tasks.forEach(task => {
        tasksByPriority[task.priority]++;
        
        if (task.columnId === 'todo') {
          tasksByStatus.todo++;
        } else if (task.columnId === 'in-progress') {
          tasksByStatus.inProgress++;
        } else if (task.columnId === 'done') {
          tasksByStatus.done++;
          completedTasks++;
        }

        if (task.dueDate && new Date(task.dueDate) < new Date() && task.columnId !== 'done') {
          overdueTasks++;
        }
      });
    });

    return {
      totalTasks,
      totalBoards,
      tasksByPriority,
      tasksByStatus,
      overdueTasks,
      completedTasks,
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu sistema de gerenciamento de tarefas</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Quadros</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBoards}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalBoards > 0 ? 'Ativos' : 'Nenhum quadro criado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTasks > 0 ? 'Ativas' : 'Nenhuma tarefa'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completionRate}% de conclusão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
              <p className="text-xs text-muted-foreground">
                Necessitam atenção
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Quadros Recentes */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Seus Quadros</h2>
          {boards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhum quadro criado ainda</p>
                <Button className="mt-4">Criar Primeiro Quadro</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map(board => (
                <Card key={board.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{board.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">{board.columns.length} colunas</span>
                      <span className="text-sm text-gray-600">{board.tasks.length} tarefas</span>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline">A Fazer: {board.tasks.filter(t => t.columnId === 'todo').length}</Badge>
                      <Badge variant="outline">Progresso: {board.tasks.filter(t => t.columnId === 'in-progress').length}</Badge>
                      <Badge variant="outline">Concluído: {board.tasks.filter(t => t.columnId === 'done').length}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;