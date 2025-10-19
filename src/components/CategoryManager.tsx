"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, DollarSign, Car, ForkKnife, Gamepad, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { mockCategories } from '@/data/mockData';
import { Category } from '@/data/types';
import { useToast } from '@/components/ui/use-toast';
import { EditCategoryDialog } from './EditCategoryDialog'; // Importando o novo componente

// Mapeamento de ícones para facilitar a seleção (simplificado)
const iconOptions = [
  { value: 'ForkKnife', icon: ForkKnife, name: 'Alimentação' },
  { value: 'DollarSign', icon: DollarSign, name: 'Salário' },
  { value: 'Car', icon: Car, name: 'Transporte' },
  { value: 'TrendingUp', icon: TrendingUp, name: 'Investimentos' },
  { value: 'Gamepad', icon: Gamepad, name: 'Lazer' },
];

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');
  const [newCategoryIcon, setNewCategoryIcon] = useState('ForkKnife');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Estado para edição
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false); // Simula o estado de loading
  
  const { toast } = useToast();

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria não pode ser vazio.',
        variant: 'destructive',
      });
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(), // ID temporário
      name: newCategoryName.trim(),
      type: newCategoryType,
      icon: newCategoryIcon,
    };

    setCategories((prevCategories) => [...prevCategories, newCategory]);
    setNewCategoryName('');
    
    toast({
      title: 'Sucesso',
      description: `Categoria '${newCategory.name}' adicionada.`,
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedCategory: Category) => {
    setIsSaving(true);
    // Simulação de salvamento (em um ambiente real, aqui seria a chamada à API)
    setTimeout(() => {
      setCategories((prevCategories) => 
        prevCategories.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      );
      setIsSaving(false);
      setIsEditDialogOpen(false);
      toast({
        title: 'Sucesso',
        description: `Categoria '${updatedCategory.name}' atualizada.`,
      });
    }, 500);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prevCategories) => prevCategories.filter(cat => cat.id !== id));
    toast({
      title: 'Excluída',
      description: 'Categoria removida.',
      variant: 'destructive',
    });
  };

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.icon : DollarSign;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl">Gerenciar Categorias</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-6">
            {/* Formulário de Adição */}
            <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-2">
              <Input
                placeholder="Nome da Categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1"
              />
              <Select value={newCategoryType} onValueChange={(value: 'income' | 'expense') => setNewCategoryType(value)}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newCategoryIcon} onValueChange={setNewCategoryIcon}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Ícone" />
                </SelectTrigger>
                <SelectContent>
                    {iconOptions.map(opt => {
                        const IconComponent = opt.icon;
                        return (
                            <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center">
                                    <IconComponent className="h-4 w-4 mr-2" />
                                    {opt.name}
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" /> Adicionar
              </Button>
            </form>

            {/* Lista de Categorias */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`h-5 w-5 ${category.type === 'income' ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="font-medium">{category.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                          category.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                          {category.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                    <div className="space-x-2">
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Excluir" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Diálogo de Edição */}
      <EditCategoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        category={editingCategory}
        onSave={handleSaveEdit}
        isLoading={isSaving}
      />
    </>
  );
};

export default CategoryManager;