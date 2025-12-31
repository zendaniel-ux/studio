'use server';

/**
 * @fileOverview Calculates and displays the cost of delaying investment by a specified number of years.
 *
 * - calculateCostOfInaction - A function that calculates the cost of inaction.
 * - CostOfInactionInput - The input type for the calculateCostOfInaction function.
 * - CostOfInactionOutput - The return type for the calculateCostOfInaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CostOfInactionInputSchema = z.object({
  initialMonthly: z.number().describe('The initial monthly investment.'),
  years: z.number().describe('The total investment horizon in years.'),
  annualReturn: z.number().describe('The annual rate of return (as a decimal).'),
  inflation: z.number().describe('The annual inflation rate (as a decimal).'),
  delayYears: z.number().describe('The number of years to delay the investment.'),
});
export type CostOfInactionInput = z.infer<typeof CostOfInactionInputSchema>;

const CostOfInactionOutputSchema = z.object({
  costOfInaction: z.number().describe('The amount of money lost by delaying the investment.'),
});
export type CostOfInactionOutput = z.infer<typeof CostOfInactionOutputSchema>;

export async function calculateCostOfInaction(input: CostOfInactionInput): Promise<CostOfInactionOutput> {
  return costOfInactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'costOfInactionPrompt',
  input: {schema: CostOfInactionInputSchema},
  output: {schema: CostOfInactionOutputSchema},
  prompt: `Calculate the cost of inaction, which is the difference in the future value of an investment if started today versus starting it after a delay.

  Here are the details of the investment:
  - Initial Monthly Investment: {{{initialMonthly}}}
  - Investment Horizon (years): {{{years}}}
  - Annual Return Rate: {{{annualReturn}}}
  - Annual Inflation Rate: {{{inflation}}}
  - Delay (years): {{{delayYears}}}
  
  First, calculate the future value of the investment if started today.  Use this formula:
  A = P * (((1 + r)^n - 1) / r)
  Where:
  - A = the future value of the investment/annuity
  - P = periodic payment amount (initialMonthly)
  - r = rate of return per period (annualReturn / 12)
  - n = number of periods (years * 12)

  Second, calculate the future value of the investment if delayed by delayYears.  Use the same formula as above, but reduce years by delayYears.

  Finally, the cost of inaction is the difference between the two future values.  Make sure the final value is a number, and nothing else.
  Return only a JSON formatted string with a single field named 'costOfInaction' representing the cost of inaction.
  `,
});

const costOfInactionFlow = ai.defineFlow(
  {
    name: 'costOfInactionFlow',
    inputSchema: CostOfInactionInputSchema,
    outputSchema: CostOfInactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
