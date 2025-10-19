"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, addCategory, Category } from '@/lib/transactions';
import { showError, showSuccess } from '@/utils/toast';
import { Plus, Loader2, Tag, Trash2, Edit, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Cores pré-definidas para as categorias
const categoryColors = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const CategoryManager: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'expense' | 'income'>('expense');
  const [newCategoryColor, setNewCategoryColor] = useState(categoryColors[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories', user?.id],
    queryFn: () => getCategories(user!.id),
    enabled: !!user?.id,
  });

  const addCategoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSuccess('Categoria adicionada com sucesso!');
      setNewCategoryName('');
      setNewCategoryColor(categoryColors[0]);
    },
    onError: (error) => {
      showError(`Erro ao adicionar categoria: ${error.message}`);
    },
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCategoryName.trim()) return;

    addCategoryMutation.mutate({
      user_id: user.id,
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: newCategoryColor,
    });
  };

  // TODO: Implementar mutações para update e delete de categorias

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <Tag className="h-4 w-4 mr-2" />
          Gerenciar Categorias
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna de Adição */}
          <div className="space-y-4 border-r pr-4 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Adicionar Nova</h3>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <Label htmlFor="categoryName">Nome</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Lazer, Salário"
                  required
                  disabled={addCategoryMutation.isPending}
                />
              </div>
              
              <div>
                <Label htmlFor="categoryType">Tipo</Label>
                <Select
                  value={newCategoryType}
                  onValueChange={(value: 'expense' | 'income') => setNewCategoryType(value)}
                  disabled={addCategoryMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cor</Label>
                <div className="flex space-x-2 mt-1">
                  {categoryColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${
                        newCategoryColor === color ? 'ring-2 ring-offset-2 ring-primary' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategoryColor(color)}
                      disabled={addCategoryMutation.isPending}
                    >
                      {newCategoryColor === color && <Check className="h-4 w-4 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={addCategoryMutation.isPending || !newCategoryName}>
                {addCategoryMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Adicionar
              </Button>
            </form>
          </div>

          {/* Coluna de Listagem */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Minhas Categorias ({categories.length})</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-64 pr-4">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || '#6B7280' }}
                        />
                        <span className="font-medium">{category.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${category.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}
                        >
                          {category.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-100 dark:hover:bg-red-900">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;