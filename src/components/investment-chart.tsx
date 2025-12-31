'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartData } from '@/lib/financials';
import { formatCurrency } from '@/lib/utils';
import { Card } from './ui/card';

interface InvestmentChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-4 border-primary/20">
        <p className="font-bold">{`Año ${label}`}</p>
        <p className="text-primary">{`Patrimonio: ${formatCurrency(payload[0].value)}`}</p>
        <p className="text-muted-foreground">{`Total Aportado: ${formatCurrency(payload[0].payload.totalContribution)}`}</p>
      </Card>
    );
  }
  return null;
};

export default function InvestmentChart({ data }: InvestmentChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis 
            dataKey="year" 
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(tick) => `Año ${tick}`}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(tick) => formatCurrency(tick as number)}
            width={100}
          />

          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="nominalValue" 
            name="Patrimonio" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            fill="url(#colorNominal)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
