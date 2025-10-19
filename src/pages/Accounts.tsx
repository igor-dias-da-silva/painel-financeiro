"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, PlusCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, insertAccount } from '@/lib/data';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/AuthGuard';
import { showError, showSuccess } from '@/utils/toast';
import AccountForm from '@/components/AccountForm';
import { Account, AccountInsert } from '@/data/types';

// Definindo o tipo de dados que o AccountForm retorna
interface AccountFormValues {
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'cash';
}

const AccountsPage = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch Accounts
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['accounts', userId],
    queryFn: getAccounts,
    enabled: !!userId,
  });

  // Mutation para Inserir Conta
  const insertMutation = useMutation({
    mutationFn: (account: AccountInsert) => insertAccount(account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', userId] });
      showSuccess('Conta adicionada com sucesso!');
      setIsFormOpen(false);
    },
    onError: (error) => {
      console.error(error);
      showError('Erro ao adicionar conta.');
    },
  });

  const handleSaveAccount = (data: AccountFormValues) => {
    if (!userId) {
      showError('Usuário não autenticado.');
      return;
    }

    const payload: AccountInsert = {
      name: data.name,
      balance: data.balance,
      type: data.type,
    };

    insertMutation.mutate(payload);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Poupança';
      case 'cash': return 'Dinheiro';
      default: return 'Outro';
    }
  };

  const isLoading = isLoadingAccounts || insertMutation.isPending;

  return (
    <AuthGuard>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold">Minhas Contas</h1>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Conta Financeira</DialogTitle>
              </DialogHeader>
              <AccountForm 
                onSubmit={handleSaveAccount} 
                isSubmitting={insertMutation.isPending} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Contas Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Saldo Atual</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.length > 0 ? (
                      accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>{getAccountTypeName(account.type)}</TableCell>
                          <TableCell className={`text-right font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(account.balance)}
                          </TableCell>
                          <TableCell className="text-center space-x-2">
                            <Button variant="ghost" size="icon" disabled>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" disabled>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          Nenhuma conta cadastrada. Clique em "Adicionar Conta" para começar.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
};

export default AccountsPage;