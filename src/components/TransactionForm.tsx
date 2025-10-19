"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DollarSign, Tag, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, addTransaction, Category, Transaction } from '@/lib/transactions';
import { showError, showSuccess } from '@/utils/toast';
import { Database } from '@/types/database';

interface TransactionFormProps {
  initialTransaction?: Transaction;
  onSuccess?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialTransaction, onSuccess }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [type, setType] = useState<'expense' | 'income'>(initialTransaction?.type || 'expense');
  const [amount, setAmount] = useState(initialTransaction?.amount.toString() || '');
  const [description, setDescription] = useState(initialTransaction?.description || '');
  const [categoryId, setCategoryId] = useState(initialTransaction?.category_id || '');
  const [date, setDate] = useState<Date | undefined>(
    initialTransaction?.transaction_date ? new Date(initialTransaction.transaction_date) : new Date()
  );

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories', user?.id],
    queryFn: () => getCategories(user!.id),
    enabled: !!user?.id,
  });

  const addTransactionMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      showSuccess('Transação registrada com sucesso!');
      setAmount('');
      setDescription('');
      setCategoryId('');
      setDate(new Date());
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      showError(`Erro ao registrar transação: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !date) {
      showError('Preencha o valor e a data.');
      return;
    }

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showError('O valor deve ser um número positivo.');
      return;
    }

    const newTransaction: Database['public']['Tables']['transactions']['Insert'] = {
      user_id: user.id,
      amount: parsedAmount,
      description: description || null,
      transaction_date: format(date, 'yyyy-MM-dd'),
      type: type,
      category_id: categoryId || null,
    };

    addTransactionMutation.mutate(newTransaction);
  };

  const isPending = addTransactionMutation.isPending;

  const filteredCategories = categories.filter(cat => cat.type === type);

  return (
    <Card className="dark:bg-card dark:border-border">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Registrar Nova Transação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Transação */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={type === 'expense' ? 'destructive' : 'outline'}
              onClick={() => setType('expense')}
              className="flex-1"
              disabled={isPending}
            >
              Despesa
            </Button>
            <Button
              type="button"
              variant={type === 'income' ? 'default' : 'outline'}
              onClick={() => setType('income')}
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              disabled={isPending}
            >
              Receita
            </Button>
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                    disabled={isPending}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={isPending || isLoadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <SelectItem value="" disabled>Carregando categorias...</SelectItem>
                ) : filteredCategories.length === 0 ? (
                  <SelectItem value="" disabled>Nenhuma categoria de {type === 'expense' ? 'despesa' : 'receita'} encontrada.</SelectItem>
                ) : (
                  filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: category.color || '#6B7280' }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Ex: Almoço com clientes, Venda de produto X"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Registrando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Salvar Transação
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;