# **App Name**: SAI Legacy Simulator

## Core Features:

- Financial Calculation Engine: Calculates the future value of an investment based on initial deposit, years, annual return, and inflation.
- Interactive Input Sliders: Allows users to adjust initial monthly investment, years, and annual return through interactive sliders.
- Future Value Charts: Graphically displays the future value of the investment over time, including nominal and real values.
- Inflexion Point Indicator: Identifies and displays the year when investment income exceeds the monthly deposit, labeled as 'Independence of the Machine'.
- Key Performance Indicators (KPIs): Displays KPIs like total patrimony, total interest earned vs total capital contributed and year of inflexion.
- 'Cost of Inaction' Display: Calculates and displays the amount of money lost by delaying the start of investment, shown as a red banner. Requires usage of the financial calculation engine tool.
- Firebase App Hosting Integration: Configures the application for deployment on Firebase App Hosting via GitHub, with firebase.config.js

## Style Guidelines:

- Primary color: Emerald green (#10b981) for accents, conveying growth and stability.
- Background color: Dark navy (#0f172a) for a premium dark aesthetic.
- Accent color: Teal (#2dd4bf) to complement emerald green.
- Body and headline font: 'Inter', a sans-serif with a neutral, modern look.
- Use Shadcn/ui components where possible, and otherwise use Tailwind CSS to build sliders and input components. Charts should use Recharts library, and include entry animations for a smooth user experience.
- Subtle animations when updating charts, displaying new information or changes to KPIs to improve the visual experience and intuition of the application.
- Use financial related iconography for better usability.