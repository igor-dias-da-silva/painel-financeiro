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
import { Loader2 } from 'lucide-react';
import { Account, AccountInsert } from '@/data/types';
import { useTranslation } from 'react-i18next';

const accountTypes = ['checking', 'savings', 'cash'] as const;

const accountSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  balance: z.number().min(0, 'O saldo inicial não pode ser negativo.'),
  type: z.enum(accountTypes, {
    required_error: 'O tipo de conta é obrigatório.',
  }),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
  initialData?: Account;
  onSubmit: (data: AccountFormValues) => void;
  isSubmitting: boolean;
}

const AccountForm: React.FC<AccountFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const { t } = useTranslation();
  
  const defaultValues: Partial<AccountFormValues> = initialData
    ? {
        name: initialData.name,
        balance: initialData.balance,
        type: initialData.type,
      }
    : {
        name: '',
        balance: 0,
        type: 'checking',
      };

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: defaultValues as AccountFormValues,
  });

  const handleSubmit = (data: AccountFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Nome da Conta */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('accountForm.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('accountForm.namePlaceholder')} {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo de Conta */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('accountForm.type')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('accountForm.selectType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="checking">{t('accounts.checking')}</SelectItem>
                  <SelectItem value="savings">{t('accounts.savings')}</SelectItem>
                  <SelectItem value="cash">{t('accounts.cash')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Saldo Inicial */}
        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('accountForm.initialBalance')}</FormLabel>
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('accountForm.saving')}</>
          ) : (
            initialData ? t('accountForm.saveChanges') : t('accountForm.create')
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AccountForm;