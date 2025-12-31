export interface ChartData {
  year: number;
  nominalValue: number;
  realValue: number;
  totalContribution: number;
  interestEarned: number;
}

export interface SimulationResult {
  chartData: ChartData[];
  finalNominalValue: number;
  totalContribution: number;
  totalInterest: number;
  inflexionYear: number | null;
}

export function calculateInvestmentGrowth({
  initialMonthly,
  years,
  annualReturn,
  inflation,
}: {
  initialMonthly: number;
  years: number;
  annualReturn: number;
  inflation: number;
}): SimulationResult {
  const chartData: ChartData[] = [];
  let inflexionYear: number | null = null;
  const monthlyReturnRate = annualReturn / 100 / 12;
  const annualInflationRate = inflation / 100;

  if (monthlyReturnRate === 0) {
    for (let i = 1; i <= years; i++) {
      const months = i * 12;
      const nominalValue = initialMonthly * months;
      const realValue = nominalValue / Math.pow(1 + annualInflationRate, i);
      chartData.push({
        year: i,
        nominalValue,
        realValue,
        totalContribution: nominalValue,
        interestEarned: 0,
      });
    }
  } else {
    for (let i = 1; i <= years; i++) {
      const months = i * 12;
      const totalContribution = initialMonthly * months;
      
      const nominalValue = initialMonthly * ((Math.pow(1 + monthlyReturnRate, months) - 1) / monthlyReturnRate);
      const realValue = nominalValue / Math.pow(1 + annualInflationRate, i);
      const interestEarned = nominalValue - totalContribution;

      if (inflexionYear === null) {
        if (nominalValue * monthlyReturnRate > initialMonthly) {
          inflexionYear = i;
        }
      }

      chartData.push({
        year: i,
        nominalValue,
        realValue,
        totalContribution,
        interestEarned,
      });
    }
  }
  
  const finalDataPoint = chartData[chartData.length - 1] || { nominalValue: 0, totalContribution: 0, interestEarned: 0 };
  
  return {
    chartData,
    finalNominalValue: finalDataPoint.nominalValue,
    totalContribution: finalDataPoint.totalContribution,
    totalInterest: finalDataPoint.interestEarned,
    inflexionYear,
  };
}
