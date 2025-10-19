"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

interface CategoryExpenseChartProps {
  data: ExpenseData[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

    return (
      <div className="p-2 bg-card border rounded-md shadow-lg text-sm dark:bg-gray-800 dark:border-gray-700">
        <p className="font-semibold" style={{ color: data.color }}>{data.name}</p>
        <p>Valor: {data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        <p>Percentual: {percentage}%</p>
      </div>
    );
  }
  return null;
};

const CategoryExpenseChart: React.FC<CategoryExpenseChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Nenhuma despesa registrada para análise.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={5}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryExpenseChart;