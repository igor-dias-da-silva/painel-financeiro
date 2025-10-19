"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign, Car, ForkKnife, Gamepad, TrendingUp } from 'lucide-react';
import { Category } from '@/data/types';
import { showError } from '@/utils/toast';

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSave: (updatedCategory: Category) => void;
  isLoading: boolean;
}

// Mapeamento de ícones
const iconOptions = [
  { value: 'ForkKnife', icon: ForkKnife, name: 'Alimentação' },
  { value: 'DollarSign', icon: DollarSign, name: 'Salário' },
  { value: 'Car', icon: Car, name: 'Transporte' },
  { value: 'TrendingUp', icon: TrendingUp, name: 'Investimentos' },
  { value: 'Gamepad', icon: Gamepad, name: 'Lazer' },
];

const getIconComponent = (iconName: string) => {
  const icon = iconOptions.find(opt => opt.value === iconName);
  return icon ? icon.icon : DollarSign;
};

export const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  open,
  onOpenChange,
  category,
  onSave,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [icon, setIcon] = useState('ForkKnife');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setIcon(category.icon);
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    if (!name.trim()) {
      showError('O nome da categoria é obrigatório.');
      return;
    }

    const updatedCategory: Category = {
      ...category,
      name: name.trim(),
      type,
      icon,
    };

    onSave(updatedCategory);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Atualize o nome, tipo e ícone da categoria.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="editName">Nome da Categoria</Label>
            <Input
              id="editName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da Categoria"
              className="mt-2 dark:bg-input dark:text-foreground dark:border-border"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="editType">Tipo</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)} disabled={isLoading}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="editIcon">Ícone</Label>
            <Select value={icon} onValueChange={setIcon} disabled={isLoading}>
              <SelectTrigger className="mt-2">
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvando...</> : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};