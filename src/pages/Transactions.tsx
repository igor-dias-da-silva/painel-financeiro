"use client";

import React, { useState, useMemo } from 'react';
import TransactionForm from '@/components/TransactionForm';
import CategoryManager from '@/components/CategoryManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Transaction, Category, Account, TransactionInsert } from '@/data/types';
import { AuthGuard } from '@/components/AuthGuard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, getCategories, getAccounts, insertTransaction, updateTransaction, deleteTransaction } from '@/lib/data';
import { useAuth } from '@/hooks/useAuth';
import { showError, showSuccess } from '@/utils/toast';

// Definindo o tipo de dados que o TransactionForm retorna (usa camelCase para o formulário)
interface TransactionFormValues {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  categoryId: string;
  accountId: string;
}

const Transactions = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const { toast } = useToast();

  // 1. Fetch Data
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: () => getTransactions(),
    enabled: !!userId,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories', userId],
    queryFn: () => getCategories(),
    enabled: !!userId,
  });

  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['accounts', userId],
    queryFn: () => getAccounts(),
    enabled: !!userId,
  });

  const categoriesMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  const accountsMap = useMemo(() => {
    return accounts.reduce((acc, accItem) => {
      acc[accItem.id] = accItem;
      return acc;
    }, {} as Record<string, Account>);
  }, [accounts]);

  // 2. Mutations
  const transactionMutation = useMutation({
    mutationFn: (data: { id?: string, payload: TransactionInsert }) => {
      if (data.id) {
        return updateTransaction(data.id, data.payload);
      }
      return insertTransaction(data.payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] }); // Invalida contas para atualizar saldos
      showSuccess(editingTransaction ? 'Transação atualizada!' : 'Transação adicionada!');
      setIsFormOpen(false);
      setEditingTransaction(undefined);
    },
    onError: (error) => {
      console.error(error);
      showError('Erro ao salvar transação.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] });
      showSuccess('Transação excluída.');
    },
    onError: () => showError('Erro ao excluir transação.'),
  });

  // 3. Handlers
  const handleSaveTransaction = (data: TransactionFormValues) => {
    if (!userId) {
      showError('Usuário não autenticado.');
      return;
    }

    // Mapeamento dos campos do formulário (camelCase) para os campos do Supabase (snake_case)
    const payload: TransactionInsert = {
      // user_id: userId, // <-- Erro corrigido: removido user_id para corresponder ao tipo TransactionInsert
      description: data.description,
      amount: data.amount,
      type: data.type,
      transaction_date: data.date,
      category_id: data.categoryId,
      account_id: data.accountId,
    };

    transactionMutation.mutate({ id: editingTransaction?.id, payload });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const isLoading = isLoadingTransactions || isLoadingCategories || isLoadingAccounts || transactionMutation.isPending || deleteMutation.isPending;

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-3xl font-bold">Transações</h1>

        {/* Seção de Adicionar Transação */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTransaction(undefined)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
            </DialogHeader>
            <TransactionForm
              initialData={editingTransaction}
              onSubmit={handleSaveTransaction}
              categories={categories}
              accounts={accounts}
            />
          </DialogContent>
        </Dialog>

        {/* Tabela de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((t) => (
                      <TableRow key={t.id} className={t.type === 'income' ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10'}>
                        <TableCell>{t.transaction_date}</TableCell>
                        <TableCell className="font-medium">{t.description}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            t.type === 'income' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                          }`}>
                            {t.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                        </TableCell>
                        <TableCell>{categoriesMap[t.category_id]?.name || 'N/A'}</TableCell>
                        <TableCell>{accountsMap[t.account_id]?.name || 'N/A'}</TableCell>
                        <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {t.type === 'expense' ? '-' : ''}R$ {t.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} disabled={isLoading}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} disabled={isLoading}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        Nenhuma transação encontrada. Adicione a primeira!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Gerenciamento de Categorias */}
        <CategoryManager />
      </div>
    </AuthGuard>
  );
};

export default Transactions;