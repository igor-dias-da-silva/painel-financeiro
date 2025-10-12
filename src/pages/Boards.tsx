"use client";

import React, { useState } from 'react';
import { Board } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Grid, List, Edit2, Trash2, Eye } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AuthGuard } from '@/components/AuthGuard';

const Boards = () => {
  const [boards] = useLocalStorage<Board[]>('kanban-boards', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBoard = () => {
    // This would typically open a dialog or navigate to create board page
    alert('Funcionalidade de criar quadro será implementada');
  };

  const handleEditBoard = (board: Board) => {
    // This would navigate to edit board page
    alert(`Editar quadro: ${board.title}`);
  };

  const handleDeleteBoard = (boardId: string) => {
    if (confirm('Tem certeza que deseja excluir este quadro?')) {
      // This would delete the board
      alert(`Quadro excluído: ${boardId}`);
    }
  };

  const handleViewBoard = (board: Board) => {
    // This would navigate to the board view
    alert(`Visualizar quadro: ${board.title}`);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Meus Quadros</h1>
                <p className="text-gray-600 mt-1">Gerencie todos os seus quadros de tarefas</p>
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
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>

          {/* Boards Grid/List */}
          {filteredBoards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum quadro encontrado</h3>
                <p className="text-gray-500 mb-6">
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
                <Card key={board.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{board.title}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBoard(board);
                          }}
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
                          className="text-red-500 hover:text-red-700"
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
                        <div className="text-2xl font-bold text-blue-600">{board.columns.length}</div>
                        <div className="text-xs text-gray-500">Colunas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{board.tasks.length}</div>
                        <div className="text-xs text-gray-500">Tarefas</div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">A Fazer</span>
                        <Badge variant="outline">
                          {board.tasks.filter(t => t.columnId === 'todo').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Em Progresso</span>
                        <Badge variant="outline">
                          {board.tasks.filter(t => t.columnId === 'in-progress').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Concluído</span>
                        <Badge variant="outline">
                          {board.tasks.filter(t => t.columnId === 'done').length}
                        </Badge>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                      Atualizado em {new Date(board.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                <span>Novo Quadro</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <List className="h-6 w-6 mb-2" />
                <span>Importar Quadro</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Filter className="h-6 w-6 mb-2" />
                <span>Organizar Quadros</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Boards;