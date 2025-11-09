import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '../../types';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

interface CategoryChartProps {
  transactions: Transaction[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ transactions }) => {
  const categoryData = transactions
    .reduce((acc, tx) => {
        const existing = acc.find(item => item.name === tx.category);
        if (existing) {
            existing.value += tx.amount;
        } else {
            acc.push({ name: tx.category, value: tx.amount });
        }
        return acc;
    }, [] as {name: string, value: number}[])
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e0e7ff', '#f97316', '#fb923c'];

  return (
    <Card title="Despesas por Categoria">
      <div style={{ width: '100%', height: 300 }}>
        {categoryData.length > 0 ? (
          <ResponsiveContainer>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-neutral-500 mt-16">Sem dados de despesas para exibir.</p>}
      </div>
    </Card>
  );
};

export default CategoryChart;
