'use client';

import type { SimulationResult } from '@/lib/financials';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PdfReportProps {
    initialInvestment: number;
    monthlyInvestment: number;
    investmentYears: number;
    annualReturn: number;
    simulationData: SimulationResult;
}

const KpiItem = ({ title, value, description }: { title: string, value: string, description: string }) => (
    <div className="rounded-lg border bg-card text-card-foreground p-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
    </div>
);


const PdfReport = ({ 
    initialInvestment,
    monthlyInvestment,
    investmentYears,
    annualReturn,
    simulationData 
}: PdfReportProps) => {
  return (
    <div className="bg-background text-foreground p-8 font-body">
        <header className="mb-8 text-center border-b-2 border-primary pb-4">
            <h1 className="font-headline text-4xl font-black text-primary">
                Reporte del Legado SAI
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Resumen de la proyección financiera
            </p>
        </header>

        <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Parámetros de la Simulación</h2>
            <Card className="bg-card">
                <CardContent className="p-6 grid grid-cols-2 gap-4 text-lg">
                    <div><strong>Aporte Inicial (USD):</strong> {formatCurrency(initialInvestment)}</div>
                    <div><strong>Aporte Mensual (Semilla) (USD):</strong> {formatCurrency(monthlyInvestment)}</div>
                    <div><strong>Horizonte de Inversión:</strong> {investmentYears} años</div>
                    <div><strong>Tasa Anual Esperada:</strong> {annualReturn}%</div>
                </CardContent>
            </Card>
        </section>

        <section>
            <h2 className="text-2xl font-bold mb-4 text-center">Resultados Clave (KPIs)</h2>
            <div className="grid grid-cols-2 gap-6">
                <KpiItem
                    title="Patrimonio Total"
                    value={formatCurrency(simulationData.finalNominalValue)}
                    description={`al final de ${investmentYears} años`}
                />
                <KpiItem
                    title="Intereses Ganados"
                    value={formatCurrency(simulationData.totalInterest)}
                    description="Magia del interés compuesto"
                />
                <KpiItem
                    title="Dinero Invertido"
                    value={formatCurrency(simulationData.totalContribution)}
                    description="Aporte inicial + mensual"
                />
                 <KpiItem
                    title="Duplicación del Capital"
                    value={simulationData.yearsToDouble ? `${simulationData.yearsToDouble} años` : 'N/A'}
                    description="Años para duplicar inversión"
                />
                <div className="col-span-2">
                    <KpiItem
                        title="Años para el Millón de Dólares"
                        value={simulationData.yearsToMillion ? `${simulationData.yearsToMillion} años` : 'Nunca'}
                        description="Bajo estas condiciones"
                    />
                </div>
            </div>
        </section>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
            <p>Este es un reporte generado por el Simulador del Legado SAI.</p>
            <p>Los resultados son una proyección basada en los parámetros proporcionados y no constituyen una garantía de rendimiento futuro.</p>
        </footer>
    </div>
  );
};

export default PdfReport;
