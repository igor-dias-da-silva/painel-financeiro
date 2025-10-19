"use client";

import React, { useState, useMemo } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ShoppingCart, Loader2, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrCreateBudget, getShoppingItems, addShoppingItem, updateShoppingItem, deleteShoppingItem, ShoppingItem } from '@/lib/shopping';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { exportToPdf } from '@/utils/export';
import { useProfile } from '@/hooks/useProfile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';

const SHOPPING_LIST_ID = 'shopping-list-export-content';

const ShoppingListPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const queryClient = useQueryClient();

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // 1. Fetch/Create Budget for the month
  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ['monthlyBudget', user?.id, currentMonth, currentYear],
    queryFn: () => getOrCreateBudget(user!.id, currentMonth, currentYear),
    enabled: !!user,
  });

  // 2. Fetch Shopping Items based on the Budget ID
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['shoppingItems', budget?.id],
    queryFn: () => getShoppingItems(budget!.id),
    enabled: !!budget,
  });

  const addMutation = useMutation({
    mutationFn: (newItem: Omit<ShoppingItem, 'id' | 'created_at'>) => addShoppingItem(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingItems', budget?.id] });
      showSuccess('Item adicionado à lista!');
      setNewItemName('');
      setNewItemPrice('');
    },
    onError: () => showError('Erro ao adicionar item.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string, updates: Partial<ShoppingItem> }) => updateShoppingItem(itemId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingItems', budget?.id] }),
    onError: () => showError('Erro ao atualizar item.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => deleteShoppingItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingItems', budget?.id] }),
    onError: () => showError('Erro ao deletar item.'),
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newItemPrice);
    if (newItemName.trim() && !isNaN(price) && price >= 0 && budget && user) {
      addMutation.mutate({
        user_id: user.id,
        budget_id: budget.id,
        name: newItemName.trim(),
        price,
        purchased: false,
      });
    } else {
      showError('Por favor, preencha o nome e o preço corretamente.');
    }
  };

  const handleTogglePurchased = (item: ShoppingItem) => {
    updateMutation.mutate({ itemId: item.id, updates: { purchased: !item.purchased } });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = `Lista_Compras_${format(currentDate, 'MM_yyyy')}.pdf`;
      await exportToPdf(SHOPPING_LIST_ID, filename);
      showSuccess('Lista exportada para PDF!');
    } catch (e) {
      // Erro já tratado dentro de exportToPdf
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const { totalPlanned, totalPurchased } = useMemo(() => {
    const totalPlanned = items?.reduce((sum, item) => sum + Number(item.price), 0) || 0;
    const totalPurchased = items?.filter(i => i.purchased).reduce((sum, item) => sum + Number(item.price), 0) || 0;
    return { totalPlanned, totalPurchased };
  }, [items]);

  const isLoading = authLoading || budgetLoading || itemsLoading || profileLoading;
  const canExport = profile?.subscription_plan === 'premium' || profile?.role === 'admin';

  const ExportButton = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            <Button onClick={handleExport} disabled={isLoading || isExporting || (items?.length === 0) || !canExport}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Exportar PDF
            </Button>
          </div>
        </TooltipTrigger>
        {!canExport && (
          <TooltipContent>
            <p>A exportação de dados é um recurso Premium.</p>
            <Link to="/pricing" className="text-primary underline">Faça upgrade.</Link>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <AuthGuard>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold">Lista de Compras Mensal</h1>
          </div>
          <ExportButton />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Novo Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                      <Label htmlFor="itemName">Nome do Item</Label>
                      <Input id="itemName" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Ex: Leite, Pão" />
                    </div>
                    <div>
                      <Label htmlFor="itemPrice">Preço Estimado (R$)</Label>
                      <Input id="itemPrice" type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="Ex: 5.50" />
                    </div>
                    <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                      {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      Adicionar Item
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo da Lista</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Planejado:</span>
                    <span className="font-semibold text-lg text-blue-600">{formatCurrency(totalPlanned)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Comprado:</span>
                    <span className="font-semibold text-lg text-green-600">{formatCurrency(totalPurchased)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground pt-2">
                    <CheckCircle className="h-4 w-4 inline mr-1" /> {items?.filter(i => i.purchased).length} de {items?.length} itens comprados.
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card id={SHOPPING_LIST_ID}> {/* Adicionado ID para exportação */}
                <CardHeader>
                  <CardTitle>Itens para {format(currentDate, 'MMMM/yyyy')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Comprado</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Preço Estimado</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items && items.length > 0 ? (
                          items.map(item => (
                            <TableRow key={item.id} className={item.purchased ? 'bg-green-50/50 dark:bg-green-900/20' : ''}>
                              <TableCell>
                                <Checkbox checked={item.purchased} onCheckedChange={() => handleTogglePurchased(item)} />
                              </TableCell>
                              <TableCell className={`font-medium ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
                                {item.name}
                              </TableCell>
                              <TableCell className={`text-right ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
                                {formatCurrency(item.price)}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                              Sua lista de compras está vazia.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default ShoppingListPage;