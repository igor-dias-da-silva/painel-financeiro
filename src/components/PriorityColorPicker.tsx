"use client";

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';

interface PriorityColorPickerProps {
  currentColors: Record<string, string>;
  onSave: (newColors: Record<string, string>) => void;
  isLoading: boolean;
}

const defaultPriorityColors: Record<string, string> = {
  urgent: '#EF4444', // red-500
  high: '#F97316',   // orange-500
  medium: '#F59E0B',  // yellow-500
  low: '#3B82F6',    // blue-500
};

const priorityLabels: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export const PriorityColorPicker: React.FC<PriorityColorPickerProps> = ({
  currentColors,
  onSave,
  isLoading,
}) => {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Merge currentColors with defaults to ensure all priorities have a color
    setColors({ ...defaultPriorityColors, ...currentColors });
  }, [currentColors]);

  const handleColorChange = (priority: string, color: string) => {
    setColors(prevColors => ({
      ...prevColors,
      [priority]: color,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(colors);
  };

  return (
    <Card className="dark:bg-card dark:border-border">
      <CardContent className="p-4 space-y-4">
        <h4 className="font-medium dark:text-foreground">Cores das Prioridades</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(defaultPriorityColors).map((priority) => (
            <div key={priority} className="flex items-center justify-between">
              <Label htmlFor={`color-${priority}`} className="dark:text-gray-200">
                {priorityLabels[priority]}
              </Label>
              <Input
                id={`color-${priority}`}
                type="color"
                value={colors[priority] || defaultPriorityColors[priority]}
                onChange={(e) => handleColorChange(priority, e.target.value)}
                className="w-24 h-8 p-1 cursor-pointer dark:bg-input dark:border-border"
                disabled={isLoading}
              />
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Cores'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};