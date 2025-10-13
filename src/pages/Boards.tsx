"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Grid, List, Edit2, Trash2, Eye, Loader2 } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoards, deleteBoard, Board } from '@/lib/database';
import { CreateBoardDialog } from '@/components/CreateBoardDialog';
import { EditBoardDetailsDialog } from '@/components/EditBoardDetailsDialog';
import { showError, showSuccess } from '@/utils/toast';

const Boards = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateBoardDialog, setShowCreateBoardDialog] = useState(false);
  const [showEditBoardDetailsDialog, setShowEditBoardDetailsDialog] = useState(false);
  const [selectedBoardToEdit, setSelectedBoardToEdit] = useState<Board | null>(null);

  const userId = user?.id;

  const { data: boards, isLoading: boardsLoading, isError: boardsError } = useQuery<Board[]>({
    queryKey: ['boards', userId],
    queryFn: () => getBoards(userId!),
    enabled: !!userId,
  });

  const deleteBoardMutation = useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', userId] });
      showSuccess('Quadro excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir quadro:', error);
      showError('Erro ao excluir quadro. Tente novamente.');
    },
  });

  const filteredBoards = boards?.filter(board =>
    board.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateBoard = () => {
    setShowCreateBoardDialog(true);
  };

  const handleEditBoard = (board: Board) => {
    setSelectedBoardToEdit(board);
    setShowEditBoardDetailsDialog(true);
  };

  const handleDeleteBoard = (boardId: string) => {
    if (confirm('Tem certeza que deseja excluir este quadro? Todas as tarefas e colunas associadas serão perdidas.')) {
      deleteBoardMutation.mutate(boardId);
    }
  };

  const handleViewBoard = (boardId: string) => {
    navigate(`/boards/${boardId}`);
  };

  if (authLoading || boardsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (boardsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <CardTitle className="text-red-600 mb-4">Erro ao carregar quadros</CardTitle>
          <CardContent>
            <p className="text-gray-600">Não foi possível carregar seus quadros. Tente novamente mais tarde.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['boards', userId] })} className="mt-4">
              Recarregar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Meus Quadros</h1>
                <p className="text-gray-600 mt-1 dark:text-gray-400">Gerencie todos os seus quadros de tarefas</p>
              </div>
              
              <Button onClick={handleCreateBoard}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Quadro
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar quadros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {/* <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button> */}
          </div>

          {/* Boards Grid/List */}
          {filteredBoards.length === 0 ? (
            <Card className="dark:bg-card dark:border-border">
              <CardContent className="text-center py-12">
                <div className="mx-auto h-12 w-12 bg-gray-100 dark:bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-gray-400 dark:text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Nenhum quadro encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm ? 'Nenhum quadro corresponde à sua busca' : 'Crie seu primeiro quadro para começar'}
                </p>
                <Button onClick={handleCreateBoard}>
                  <Plus className="h-4 w-4 mr-2" />
                  {searchTerm ? 'Limpar Busca' : 'Criar Primeiro Quadro'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
            }>
              {filteredBoards.map(board => (
                <Card key={board.id} className="hover:shadow-md transition-shadow dark:bg-card dark:border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2 cursor-pointer dark:text-gray-100" onClick={() => handleViewBoard(board.id)}>
                        {board.title}
                      </CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBoard(board.id);
                          }}
                          className="dark:text-gray-300 dark:hover:bg-accent"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBoard(board);
                          }}
                          className="dark:text-gray-300 dark:hover:bg-accent"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBoard(board.id);
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:bg-accent"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {/* Placeholder for columns count, will fetch from Supabase later */}
                          {board.description ? '...' : '0'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Colunas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {/* Placeholder for tasks count, will fetch from Supabase later */}
                          {board.description ? '...' : '0'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Tarefas</div>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="mt-4 pt-4 border-t text-xs text-gray-500 dark:text-gray-400 dark:border-gray-700">
                      Atualizado em {new Date(board.updated_at).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 p-6 bg-card rounded-lg shadow-sm border dark:bg-card dark:border-border">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent" onClick={handleCreateBoard}>
                <Plus className="h-6 w-6 mb-2" />
                <span>Novo Quadro</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent" disabled>
                <List className="h-6 w-6 mb-2" />
                <span>Importar Quadro</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent" disabled>
                <Filter className="h-6 w-6 mb-2" />
                <span>Organizar Quadros</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CreateBoardDialog
        open={showCreateBoardDialog}
        onOpenChange={setShowCreateBoardDialog}
      />

      <EditBoardDetailsDialog
        open={showEditBoardDetailsDialog}
        onOpenChange={setShowEditBoardDetailsDialog}
        board={selectedBoardToEdit}
      />
    </AuthGuard>
  );
};

export default Boards;