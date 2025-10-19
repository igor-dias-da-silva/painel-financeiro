"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Category, CategoryInsert } from '@/data/types';
import EditCategoryDialog from './EditCategoryDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, insertCategory, updateCategory, deleteCategory } from '@/lib/data';
import { useAuth } from '@/hooks/useAuth';
import { showError, showSuccess } from '@/utils/toast';

const CategoryManager = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#000000');
  const [newCategoryType, setNewCategoryType] = useState<'expense' | 'income'>('expense');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  // Fetch Categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories', userId],
    queryFn: getCategories,
    enabled: !!userId,
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (newCategory: CategoryInsert) => insertCategory(newCategory),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] }); // Invalida transações para atualizar o dashboard
      showSuccess(`Categoria "${data.name}" adicionada!`);
      setNewCategoryName('');
      setNewCategoryColor('#000000');
    },
    onError: () => showError('Erro ao adicionar categoria.'),
  });

  const updateMutation = useMutation({
    mutationFn: (category: Category) => updateCategory(category.id, category),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      showSuccess(`Categoria "${data.name}" atualizada!`);
      setEditingCategory(null);
    },
    onError: () => showError('Erro ao atualizar categoria.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      showSuccess('Categoria excluída.');
    },
    onError: () => showError('Erro ao excluir categoria.'),
  });

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      showError('O nome da categoria não pode ser vazio.');
      return;
    }

    const newCategory: CategoryInsert = {
      name: newCategoryName,
      color: newCategoryColor,
      type: newCategoryType,
    };

    addMutation.mutate(newCategory);
  };

  const handleSaveEdit = (updatedCategory: Category) => {
    updateMutation.mutate(updatedCategory);
  };

  const handleDeleteCategory = (id: string) => {
    deleteMutation.mutate(id);
  };

  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);
  const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);

  const isMutating = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const isLoading = isLoadingCategories || isMutating;

  const renderCategoryTable = (title: string, list: Category[]) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingCategories ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nenhuma categoria de {title.toLowerCase().replace('categorias de ', '')} cadastrada.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((category) => {
                return (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: category.color || '#000000' }}></div>
                      {category.name}
                    </TableCell>
                    <TableCell>{category.color || 'N/A'}</TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingCategory(category)} disabled={isMutating}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)} disabled={isMutating}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gerenciar Categorias</h2>

      {/* Formulário de Adição */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <Input
              placeholder="Nome da Categoria"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
              disabled={isMutating}
            />
            <Input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="w-full md:w-16 h-10 p-1"
              disabled={isMutating}
            />
            <Select value={newCategoryType} onValueChange={(value: 'expense' | 'income') => setNewCategoryType(value)} disabled={isMutating}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddCategory} disabled={isMutating || !newCategoryName.trim()}>
              {addMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabelas de Categorias */}
      <div className="grid gap-4 md:grid-cols-2">
        {renderCategoryTable('Categorias de Despesa', expenseCategories)}
        {renderCategoryTable('Categorias de Receita', incomeCategories)}
      </div>

      {/* Diálogo de Edição */}
      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          onSave={handleSaveEdit}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
};

export default CategoryManager;