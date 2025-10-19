"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Transaction, Category, Account } from '@/data/types';
import { Loader2 } from 'lucide-react'; // Importação de Loader2

const transactionSchema = z.object({
  description: z.string().min(1, 'A descrição é obrigatória.'),
  amount: z.number().min(0.01, 'O valor deve ser maior que zero.'),
  type: z.enum(['income', 'expense'], {
    required_error: 'O tipo é obrigatório.',
  }),
  date: z.string().min(1, 'A data é obrigatória.'),
  categoryId: z.string().min(1, 'A categoria é obrigatória.'),
  accountId: z.string().min(1, 'A conta é obrigatória.'),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (data: TransactionFormValues) => void;
  categories: Category[];
  accounts: Account[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, onSubmit, categories, accounts }) => {
  // Mapeia dados do Supabase (snake_case) para o formulário (camelCase)
  const defaultValues: Partial<TransactionFormValues> = initialData
    ? {
        description: initialData.description || '',
        amount: initialData.amount,
        type: initialData.type,
        date: initialData.transaction_date,
        categoryId: initialData.category_id || '',
        accountId: initialData.account_id || '',
      }
    : {
        description: '',
        amount: 0,
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        accountId: '',
      };

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues as TransactionFormValues,
  });

  const handleSubmit = (data: TransactionFormValues) => {
    onSubmit(data);
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === form.watch('type')
  );
  
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="w-full max-w-lg mx-auto border-0 shadow-none">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Tipo (Receita/Despesa) */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Resetar categoria ao mudar o tipo
                        form.setValue('categoryId', '');
                      }}
                      defaultValue={field.value}
                      className="flex space-x-4"
                      disabled={isSubmitting}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="expense" />
                        </FormControl>
                        <FormLabel className="font-normal">Despesa</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="income" />
                        </FormControl>
                        <FormLabel className="font-normal">Receita</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aluguel, Salário, etc." {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valor */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || filteredCategories.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={filteredCategories.length === 0 ? 'Nenhuma conta disponível' : 'Selecione a Categoria'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conta */}
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || accounts.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={accounts.length === 0 ? 'Nenhuma conta disponível' : 'Selecione a Conta'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvando...</>
              ) : (
                initialData ? 'Salvar Alterações' : 'Adicionar Transação'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;