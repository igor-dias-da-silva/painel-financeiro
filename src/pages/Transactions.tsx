"use client";

import React, { useState, useMemo } from 'react';
import TransactionForm from '@/components/TransactionForm';
import CategoryManager from '@/components/CategoryManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { mockCategories, mockAccounts, mockTransactions } from '@/data/mockData';
import { Transaction, Category, Account } from '@/data/types';
import { getTransactions } from '@/lib/transactions';
import { AuthGuard } from '@/components/AuthGuard'; // <-- Importação adicionada

// Definindo o tipo de dados que o TransactionForm retorna
interface TransactionFormValues {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  categoryId: string;
  accountId: string;
}

const Transactions = () => {
  // Usando o tipo Transaction de src/data/types
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const { toast } = useToast();

  const categoriesMap = useMemo(() => {
    return mockCategories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, Category>); // Usando o tipo Category correto
  }, []);

  const accountsMap = useMemo(() => {
    return mockAccounts.reduce((acc, accItem) => {
      acc[accItem.id] = accItem;
      return acc;
    }, {} as Record<string, Account>); // Usando o tipo Account correto
  }, []);

  const handleSaveTransaction = (data: TransactionFormValues) => { // Tipagem corrigida
    if (editingTransaction) {
      // Lógica de edição
      setTransactions(
        transactions.map((t) => (t.id === editingTransaction.id ? { ...t, ...data } : t))
      );
    } else {
      // Lógica de adição
      const newTransaction: Transaction = {
        ...data,
        id: Date.now().toString(),
      };
      setTransactions([...transactions, newTransaction]);
    }
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    toast({
      title: 'Transação Excluída',
      description: 'A transação foi removida com sucesso.',
      variant: 'destructive',
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

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
              initialData={editingTransaction} // Tipo Transaction agora é compatível
              onSubmit={handleSaveTransaction}
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
                  {transactions.map((t) => (
                    <TableRow key={t.id} className={t.type === 'income' ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10'}>
                      <TableCell>{t.date}</TableCell> {/* CORRIGIDO: Propriedade 'date' existe em Transaction */}
                      <TableCell className="font-medium">{t.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          t.type === 'income' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                        }`}>
                          {t.type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                      </TableCell>
                      <TableCell>{categoriesMap[t.categoryId]?.name || 'N/A'}</TableCell> {/* CORRIGIDO: Propriedade 'categoryId' existe em Transaction */}
                      <TableCell>{accountsMap[t.accountId]?.name || 'N/A'}</TableCell> {/* CORRIGIDO: Propriedade 'accountId' existe em Transaction */}
                      <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.type === 'expense' ? '-' : ''}R$ {t.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(t.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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