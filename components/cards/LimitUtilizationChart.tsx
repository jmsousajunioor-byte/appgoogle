import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card as CardType, Invoice } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface LimitUtilizationChartProps {
  invoices: Invoice[];
  cards: CardType[];
}

const monthMap: { [key: string]: number } = { 'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3, 'Maio': 4, 'Junho': 5, 'Julho': 6, 'Agosto': 7, 'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11 };

const LimitUtilizationChart: React.FC<LimitUtilizationChartProps> = ({ invoices, cards }) => {
    const chartData = useMemo(() => {
        const monthlyData: { [key: string]: { totalAmount: number; date: Date } } = {};

        invoices.forEach(invoice => {
            const date = new Date(invoice.year, monthMap[invoice.month] ?? 0);
            const key = `${invoice.month.substring(0, 3)}/${String(invoice.year).slice(2)}`;
            
            if (!monthlyData[key]) {
                monthlyData[key] = { totalAmount: 0, date };
            }
            monthlyData[key].totalAmount += invoice.totalAmount;
        });

        const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);

        return Object.entries(monthlyData)
            .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
            .slice(-6)
            .map(([name, data]) => ({
                name,
                valor: data.totalAmount,
                percentual: totalLimit > 0 ? (data.totalAmount / totalLimit) * 100 : 0,
            }));
    }, [invoices, cards]);

    
    if (chartData.length === 0) {
        return <p className="text-center text-neutral-500 py-10">Dados insuficientes para gerar o gráfico.</p>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                    <YAxis yAxisId="left" stroke="currentColor" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis yAxisId="right" orientation="right" stroke="currentColor" fontSize={12} tickFormatter={(value) => `${value.toFixed(0)}%`} />
                    <Tooltip
                        formatter={(value, name) => (name === 'Valor da Fatura' ? formatCurrency(Number(value)) : `${Number(value).toFixed(2)}%`)}
                        contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            borderColor: '#374151',
                            borderRadius: '12px',
                        }}
                        labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="valor" stroke="#8b5cf6" strokeWidth={2} name="Valor da Fatura" />
                    <Line yAxisId="right" type="monotone" dataKey="percentual" stroke="#f97316" strokeWidth={2} name="Uso do Limite (%)" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LimitUtilizationChart;
