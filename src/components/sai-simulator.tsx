'use client';

import { useState, useMemo, type ReactNode, useRef } from 'react';
import { AlertTriangle, CalendarDays, DollarSign, FileDown, Landmark, TrendingUp, Zap, PiggyBank, Repeat, Rocket } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { calculateInvestmentGrowth, type SimulationResult } from '@/lib/financials';
import { formatCurrency } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import KpiCard from '@/components/kpi-card';
import InvestmentChart from '@/components/investment-chart';
import PdfReport from './pdf-report';

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

// Lógica para calcular cuánto le cuesta al hijo el retraso del padre
const calculateInactionCost = (monthly: number, initial: number, totalYears: number, annualRate: number) => {
  if (totalYears <= 3) {
    return { loss3Years: 0, lossPerDay: 0 };
  }
  const r = annualRate / 100 / 12; // Tasa mensual
  
  // Función de Valor Futuro de una anualidad
  const FV_annuity = (p: number, rate: number, n: number) => p * ((Math.pow(1 + rate, n) - 1) / rate);
  // Función de Valor Futuro de un monto único
  const FV_lumpsum = (pv: number, rate: number, n: number) => pv * Math.pow(1 + rate, n);

  const nTotal = totalYears * 12;
  const totalNow = FV_lumpsum(initial, r, nTotal) + FV_annuity(monthly, r, nTotal);
  
  const nDelayed3 = (totalYears - 3) * 12;
  // Si se retrasa 3 años, el aporte inicial también empieza a capitalizar 3 años después
  const totalDelayed3 = FV_lumpsum(initial, r, nDelayed3) + FV_annuity(monthly, r, nDelayed3);
  
  const loss3Years = totalNow - totalDelayed3;

  return {
    loss3Years: loss3Years,
    lossPerDay: loss3Years / (3 * 365),
  };
};

export default function SaiSimulator() {
  const [initialInvestment, setInitialInvestment] = useState(1000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(100);
  const [investmentYears, setInvestmentYears] = useState(18);
  const [annualReturn, setAnnualReturn] = useState(9.4);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const simulationData: SimulationResult = useMemo(() => {
    return calculateInvestmentGrowth({
      initialInvestment: initialInvestment,
      initialMonthly: monthlyInvestment,
      years: investmentYears,
      annualReturn: annualReturn,
    });
  }, [initialInvestment, monthlyInvestment, investmentYears, annualReturn]);
  
  const inactionCost = useMemo(() => {
    return calculateInactionCost(monthlyInvestment, initialInvestment, investmentYears, annualReturn);
  }, [monthlyInvestment, initialInvestment, investmentYears, annualReturn]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    const input = reportRef.current;
    if (!input) {
      setIsExporting(false);
      return;
    }

    // A4 dimensions in pixels at 96 DPI: 794x1123. We scale for better quality.
    const scale = 2; 
    const canvas = await html2canvas(input, {
      scale: scale,
      useCORS: true,
      width: input.offsetWidth,
      height: input.offsetHeight,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm: 210x297
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let imgWidth = pdfWidth;
    let imgHeight = imgWidth / ratio;
    
    if (imgHeight > pdfHeight) {
      imgHeight = pdfHeight;
      imgWidth = imgHeight * ratio;
    }
    
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save('reporte-legado-sai.pdf');
    setIsExporting(false);
  };

  return (
    <>
      <div style={{ position: 'fixed', left: '-2000px', top: 0, zIndex: -1 }}>
        <div ref={reportRef} style={{ width: '794px', height: '1123px' }}>
            <PdfReport
                initialInvestment={initialInvestment}
                monthlyInvestment={monthlyInvestment}
                investmentYears={investmentYears}
                annualReturn={annualReturn}
                simulationData={simulationData}
            />
        </div>
      </div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-col items-center text-center">
          <h1 className="font-headline text-4xl font-black tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Simulador del Legado SAI
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Una herramienta de cálculo financiero para visualizar el futuro patrimonio de tus hijos y el poder del interés compuesto.
          </p>
          <div className="mt-6">
            <Button onClick={handleExportPdf} disabled={isExporting}>
              <FileDown className="mr-2 h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Exportar a PDF'}
            </Button>
          </div>
        </header>

        <div className="flex flex-col-reverse gap-8 lg:grid lg:grid-cols-3">
          <main className="space-y-8 lg:col-span-2">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-bold">El Costo de Esperar</AlertTitle>
              <AlertDescription>
                  <p>Si esperas 3 años para empezar con estos parámetros (Aporte inicial: {formatCurrency(initialInvestment)}, Capital Semilla Mensual: {formatCurrency(monthlyInvestment)}, Horizonte: {investmentYears} años, Tasa Anual: {annualReturn}%), tu hijo podría perder <strong>{formatCurrency(inactionCost.loss3Years)}</strong> de su futuro.</p>
                  <p className="text-xs mt-1">Eso es <strong>{formatCurrency(inactionCost.lossPerDay)}</strong> perdidos por CADA DÍA de duda.</p>
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
                title="Intereses Ganados"
                value={formatCurrency(simulationData.totalInterest)}
                description="Magia del interés compuesto"
                icon={<TrendingUp />}
              />
              <KpiCard
                title="Dinero Invertido"
                value={formatCurrency(simulationData.totalContribution)}
                description="Aporte inicial + mensual"
                icon={<PiggyBank />}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <KpiCard
                title="Duplicación del Capital"
                value={simulationData.yearsToDouble ? `${simulationData.yearsToDouble} años` : 'N/A'}
                description="Años para duplicar inversión"
                icon={<Repeat />}
              />
              <KpiCard
                title="Años para el Millón de Dólares"
                value={simulationData.yearsToMillion ? `${simulationData.yearsToMillion} años` : 'Nunca'}
                description="Bajo estas condiciones"
                icon={<Rocket />}
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
          <aside className="space-y-8 lg:col-span-1">
            <Card className="shadow-2xl shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-xl">Parámetros de Inversión (en USD)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <ControlSlider
                  label="Aporte Inicial"
                  icon={<DollarSign className="h-4 w-4" />}
                  value={initialInvestment}
                  onValueChange={setInitialInvestment}
                  min={0}
                  max={50000}
                  step={500}
                  unit=""
                />
                <ControlSlider
                  label="Capital Semilla Mensual"
                  icon={<DollarSign className="h-4 w-4" />}
                  value={monthlyInvestment}
                  onValueChange={setMonthlyInvestment}
                  min={50}
                  max={2000}
                  step={50}
                  unit=""
                />
                <ControlSlider
                  label="Horizonte (tiempo de inversión)"
                  icon={<CalendarDays className="h-4 w-4" />}
                  value={investmentYears}
                  onValueChange={setInvestmentYears}
                  min={1}
                  max={50}
                  step={1}
                  unit="años"
                />
                <ControlSlider
                  label="Tasa Anual"
                  icon={<Zap className="h-4 w-4" />}
                  value={annualReturn}
                  onValueChange={setAnnualReturn}
                  min={0}
                  max={20}
                  step={0.1}
                  unit="%"
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
