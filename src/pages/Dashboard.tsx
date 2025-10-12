"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, LayoutDashboard, ListTodo } from 'lucide-react';
import { Board, getTotalCards } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';

const fetchBoards = async (userId: string): Promise<Board[]> => {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false }); // Order by last updated
  
  if (error) throw new Error(error.message);
  return data || [];
};

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id;

  const { data: boards, isLoading: boardsLoading, isError: boardsError } = useQuery<Board[]>({
    queryKey: ['boards', userId],
    queryFn: () => fetchBoards(userId!),
    enabled: !!userId, // Only run query if userId is available
  });

  const { data: totalTasks, isLoading: tasksLoading, isError: tasksError } = useQuery<number>({
    queryKey: ['totalTasks', userId],
    queryFn: () => getTotalCards(userId!),
    enabled: !!userId, // Only run query if userId is available
  });

  const isLoading = authLoading || boardsLoading || tasksLoading;
  const isError = boardsError || tasksError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erro:</strong>
        <span className="block sm:inline"> Não foi possível carregar os dados do dashboard.</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral das suas atividades e quadros</p>
        </div>
        <div className="flex gap-2">
          <Link to="/boards">
            <Button variant="outline">
              Ver Todos os Quadros
            </Button>
          </Link>
          <Button onClick={() => navigate('/boards')}> {/* Assuming /boards page has a way to create new board */}
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Quadro
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Quadros</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boards?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Quadros criados por você</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks || 0}</div>
            <p className="text-xs text-muted-foreground">Tarefas em todos os seus quadros</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Boards */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quadros Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {boards && boards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum quadro criado ainda.
              <Button variant="link" onClick={() => navigate('/boards')} className="block mt-2">
                Crie seu primeiro quadro!
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {boards?.slice(0, 3).map((board) => (
                <div key={board.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Link to={`/boards/${board.id}`} className="font-medium text-blue-600 hover:underline">
                      {board.title}
                    </Link>
                    <p className="text-sm text-gray-600 line-clamp-1">{board.description || 'Sem descrição'}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    Atualizado em {new Date(board.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call to Action for more boards */}
      {boards && boards.length > 3 && (
        <div className="text-center mt-8">
          <Link to="/boards">
            <Button variant="outline">
              Ver Todos os {boards.length} Quadros
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;