export interface ChartData {
  year: number;
  nominalValue: number;
  totalContribution: number;
  interestEarned: number;
}

export interface SimulationResult {
  chartData: ChartData[];
  finalNominalValue: number;
  totalContribution: number;
  totalInterest: number;
  inflexionYear: number | null;
  yearsToDouble: number | null;
  yearsToMillion: number | null;
}

export function calculateInvestmentGrowth({
  initialInvestment,
  initialMonthly,
  years,
  annualReturn,
}: {
  initialInvestment: number;
  initialMonthly: number;
  years: number;
  annualReturn: number;
}): SimulationResult {
  const chartData: ChartData[] = [];
  let inflexionYear: number | null = null;
  let yearsToDouble: number | null = null;
  const monthlyReturnRate = annualReturn / 100 / 12;

  let currentValue = initialInvestment;
  let totalContribution = initialInvestment;

  if (annualReturn === 0) {
      for (let i = 1; i <= years; i++) {
          const months = i * 12;
          totalContribution = initialInvestment + initialMonthly * months;
          currentValue = totalContribution;
          chartData.push({
              year: i,
              nominalValue: currentValue,
              totalContribution: totalContribution,
              interestEarned: 0,
          });
      }
  } else {
      for (let year = 1; year <= years; year++) {
          let yearEndValue = currentValue;
          let yearlyContribution = 0;
          
          for (let month = 1; month <= 12; month++) {
              yearEndValue = (yearEndValue + initialMonthly) * (1 + monthlyReturnRate);
              yearlyContribution += initialMonthly;
          }

          currentValue = yearEndValue;
          totalContribution += yearlyContribution;
          const interestEarned = currentValue - totalContribution;

          if (inflexionYear === null) {
              const monthlyInterest = (currentValue - yearlyContribution) * monthlyReturnRate;
              if (monthlyInterest > initialMonthly) {
                  inflexionYear = year;
              }
          }

          if (yearsToDouble === null && currentValue >= totalContribution * 2) {
            yearsToDouble = year;
          }
          
          chartData.push({
              year: year,
              nominalValue: currentValue,
              totalContribution: totalContribution,
              interestEarned: interestEarned,
          });
      }
  }
  
  let yearsToMillion: number | null = null;
  if (currentValue < 1000000 && annualReturn > 0) {
    let futureValue = currentValue;
    let additionalYears = 0;
    while (futureValue < 1000000) {
      for (let month = 1; month <= 12; month++) {
        futureValue = (futureValue + initialMonthly) * (1 + monthlyReturnRate);
      }
      additionalYears++;
      if (additionalYears > 100) { // Safety break
        additionalYears = null;
        break;
      }
    }
    if (additionalYears) {
      yearsToMillion = years + additionalYears;
    }
  } else if (currentValue >= 1000000) {
    yearsToMillion = years;
     for (let i = 0; i < chartData.length; i++) {
      if (chartData[i].nominalValue >= 1000000) {
        yearsToMillion = chartData[i].year;
        break;
      }
    }
  }


  const finalDataPoint = chartData[chartData.length - 1] || { nominalValue: initialInvestment, totalContribution: initialInvestment, interestEarned: 0 };
  
  return {
    chartData,
    finalNominalValue: finalDataPoint.nominalValue,
    totalContribution: finalDataPoint.totalContribution,
    totalInterest: finalDataPoint.interestEarned,
    inflexionYear,
    yearsToDouble,
    yearsToMillion,
  };
}
