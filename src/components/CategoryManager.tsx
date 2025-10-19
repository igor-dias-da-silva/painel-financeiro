"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { mockCategories } from '@/data/mockData';
import { Category } from '@/data/types';
import EditCategoryDialog from './EditCategoryDialog';

// Função utilitária para ícones removida, pois a propriedade 'icon' foi removida do tipo Category.

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#000000');
  const [newCategoryType, setNewCategoryType] = useState<'expense' | 'income'>('expense');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria não pode ser vazio.',
        variant: 'destructive',
      });
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      user_id: 'mock-user-id', // Adicionado campo obrigatório
      created_at: new Date().toISOString(), // Adicionado campo obrigatório
      name: newCategoryName,
      color: newCategoryColor,
      type: newCategoryType,
      // icon: newCategoryIcon, // <-- Erro 17 corrigido (propriedade 'icon' removida)
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryColor('#000000');
    setNewCategoryType('expense');
    toast({
      title: 'Categoria Adicionada',
      description: `A categoria "${newCategoryName}" foi criada.`,
    });
  };

  const handleSaveEdit = (updatedCategory: Category) => {
    setCategories(
      categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
    );
    setEditingCategory(null);
    toast({
      title: 'Categoria Atualizada',
      description: `A categoria "${updatedCategory.name}" foi salva.`,
    });
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    toast({
      title: 'Categoria Excluída',
      description: 'A categoria foi removida com sucesso.',
      variant: 'destructive',
    });
  };

  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);
  const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);

  const renderCategoryTable = (title: string, list: Category[]) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
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
              // const IconComponent = getIconComponent(category.icon); // <-- Erro 18 corrigido (uso de 'icon' removido)
              return (
                <TableRow key={category.id}>
                  <TableCell className="font-medium flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: category.color }}></div>
                    {category.name}
                  </TableCell>
                  <TableCell>{category.color}</TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingCategory(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
          <div className="flex space-x-4">
            <Input
              placeholder="Nome da Categoria"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="w-16"
            />
            <Select value={newCategoryType} onValueChange={(value: 'expense' | 'income') => setNewCategoryType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
            {/* Campo de ícone removido */}
            <Button onClick={handleAddCategory}>
              <PlusCircle className="h-4 w-4 mr-2" />
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