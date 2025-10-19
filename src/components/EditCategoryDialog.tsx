"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/data/types';
import { useTranslation } from 'react-i18next';

interface EditCategoryDialogProps {
  category: Category;
  onSave: (category: Category) => void;
  onClose: () => void;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({ category, onSave, onClose }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [type, setType] = useState<'expense' | 'income'>(category.type);

  useEffect(() => {
    setName(category.name);
    setColor(category.color);
    setType(category.type);
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedCategory: Category = {
      ...category,
      name,
      color,
      type,
    };

    onSave(updatedCategory);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('categories.editTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('categories.name')}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">{t('categories.color')}</Label>
            <Input id="color" type="color" value={color || '#000000'} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{t('categories.type')}</Label>
            <Select value={type} onValueChange={(value: 'expense' | 'income') => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('categories.selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">{t('categories.expense')}</SelectItem>
                <SelectItem value="income">{t('categories.income')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">{t('categories.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;