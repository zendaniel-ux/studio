'use client';

import { useState, useMemo, useEffect, type ReactNode } from 'react';
import { AlertTriangle, CalendarDays, DollarSign, FileDown, Landmark, Percent, Target, TrendingUp, Zap } from 'lucide-react';

import { calculateInvestmentGrowth, type SimulationResult } from '@/lib/financials';
import { formatCurrency } from '@/lib/utils';
import { calculateCostOfInaction } from '@/ai/flows/cost-of-inaction';
import { useToast } from "@/hooks/use-toast"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import KpiCard from '@/components/kpi-card';
import InvestmentChart from '@/components/investment-chart';

const ControlSlider = ({
  label,
  icon,
  value,
  onValueChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  icon: ReactNode;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="h-8 w-24 border-0 bg-transparent text-right font-bold text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
    <Slider
      value={[value]}
      onValueChange={(val) => onValueChange(val[0])}
      min={min}
      max={max}
      step={step}
    />
  </div>
);

export default function SaiSimulator() {
  const { toast } = useToast();
  const [monthlyInvestment, setMonthlyInvestment] = useState(100);
  const [investmentYears, setInvestmentYears] = useState(18);
  const [annualReturn, setAnnualReturn] = useState(9.4);
  const [inflation, setInflation] = useState(2.5);

  const [costOfInaction, setCostOfInaction] = useState<number | null>(null);
  const [isCalculatingCost, setIsCalculatingCost] = useState(true);

  const simulationData: SimulationResult = useMemo(() => {
    return calculateInvestmentGrowth({
      initialMonthly: monthlyInvestment,
      years: investmentYears,
      annualReturn: annualReturn,
      inflation: inflation,
    });
  }, [monthlyInvestment, investmentYears, annualReturn, inflation]);

  useEffect(() => {
    const calculateCost = async () => {
      setIsCalculatingCost(true);
      try {
        const result = await calculateCostOfInaction({
          initialMonthly: monthlyInvestment,
          years: investmentYears,
          annualReturn: annualReturn / 100,
          inflation: inflation / 100,
          delayYears: 3,
        });
        setCostOfInaction(result.costOfInaction);
      } catch (error) {
        console.error("Error calculating cost of inaction:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not calculate the cost of inaction.",
        });
        setCostOfInaction(null);
      } finally {
        setIsCalculatingCost(false);
      }
    };
    calculateCost();
  }, [monthlyInvestment, investmentYears, annualReturn, inflation, toast]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col items-center text-center">
        <h1 className="font-headline text-4xl font-black tracking-tight text-primary sm:text-5xl lg:text-6xl">
          Simulador del Legado SAI
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Una herramienta de cálculo financiero para visualizar el futuro patrimonio de tus hijos y el poder del interés compuesto.
        </p>
        <div className="mt-6">
          <Button variant="outline" disabled>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar a PDF
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <aside className="space-y-8 lg:col-span-1">
          <Card className="shadow-2xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-xl">Parámetros de Inversión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <ControlSlider
                label="Semilla Mensual"
                icon={<DollarSign className="h-4 w-4" />}
                value={monthlyInvestment}
                onValueChange={setMonthlyInvestment}
                min={50}
                max={2000}
                step={50}
                unit="$"
              />
              <ControlSlider
                label="Horizonte"
                icon={<CalendarDays className="h-4 w-4" />}
                value={investmentYears}
                onValueChange={setInvestmentYears}
                min={1}
                max={50}
                step={1}
                unit="años"
              />
              <ControlSlider
                label="Tasa Neta"
                icon={<Target className="h-4 w-4" />}
                value={annualReturn}
                onValueChange={setAnnualReturn}
                min={0}
                max={20}
                step={0.1}
                unit="%"
              />
              <ControlSlider
                label="Inflación"
                icon={<TrendingUp className="h-4 w-4" />}
                value={inflation}
                onValueChange={setInflation}
                min={0}
                max={10}
                step={0.1}
                unit="%"
              />
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-8 lg:col-span-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-bold">Costo de la Inacción</AlertTitle>
            <AlertDescription>
              {isCalculatingCost ? (
                <Skeleton className="h-5 w-3/4" />
              ) : (
                `Si esperas 3 años para empezar, tu hijo perderá ${formatCurrency(costOfInaction ?? 0)} de su futuro.`
              )}
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              title="Patrimonio Total"
              value={formatCurrency(simulationData.finalNominalValue)}
              description={`al final de ${investmentYears} años`}
              icon={<Landmark />}
            />
            <KpiCard
              title="Dinero Regalado"
              value={formatCurrency(simulationData.totalInterest)}
              description="Total intereses ganados"
              icon={<TrendingUp />}
            />
            <KpiCard
              title="Independencia"
              value={simulationData.inflexionYear ? `Año ${simulationData.inflexionYear}` : 'N/A'}
              description="Punto de inflexión"
              icon={<Zap />}
            />
          </div>

          <Card className="shadow-2xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-xl">Proyección de Crecimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <InvestmentChart data={simulationData.chartData} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
