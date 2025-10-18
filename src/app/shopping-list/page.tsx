"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, ShoppingCart } from 'lucide-react';

interface ShoppingItem {
  id: number;
  name: string;
  price: number;
  purchased: boolean;
}

const ShoppingListPage = () => {
  const [salary, setSalary] = useState<number>(0);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const totalExpenses = useMemo(() => {
    return items.reduce((total, item) => total + item.price, 0);
  }, [items]);

  const remainingBalance = useMemo(() => {
    return salary - totalExpenses;
  }, [salary, totalExpenses]);

  const handleAddItem = () => {
    const price = parseFloat(newItemPrice);
    if (newItemName.trim() && !isNaN(price) && price > 0) {
      const newItem: ShoppingItem = {
        id: Date.now(),
        name: newItemName.trim(),
        price,
        purchased: false,
      };
      setItems([...items, newItem]);
      setNewItemName('');
      setNewItemPrice('');
    }
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleTogglePurchased = (id: number) => {
    setItems(
      items.map(item =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center mb-6">
        <ShoppingCart className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold">Lista de Compras e Orçamento</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Coluna de Orçamento e Totais */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meu Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="salary">Salário / Orçamento Mensal</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="R$ 0,00"
                  value={salary || ''}
                  onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Orçamento Total:</span>
                <span className="font-semibold text-lg">{formatCurrency(salary)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Gastos Previstos:</span>
                <span className="font-semibold text-lg text-red-500">{formatCurrency(totalExpenses)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Saldo Restante:</span>
                <span className={`font-bold text-xl ${remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(remainingBalance)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna da Lista de Compras */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens da Lista</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nome do item"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Preço (R$)"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  className="w-32"
                />
                <Button onClick={handleAddItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3 h-96 overflow-y-auto pr-2">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Sua lista de compras está vazia.</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.purchased}
                        onCheckedChange={() => handleTogglePurchased(item.id)}
                      />
                      <Label
                        htmlFor={`item-${item.id}`}
                        className={`flex-1 text-base ${item.purchased ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.name}
                      </Label>
                      <span className={`font-semibold ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
                        {formatCurrency(item.price)}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListPage;