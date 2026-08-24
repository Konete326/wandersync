import { useId } from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { formatDate } from '@/components/formater';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Delta, DeltaIcon, DeltaValue } from '@/components/delta';
import { DashboardCard } from '@/components/dashboard-card';

const VISIBLE_DAYS = 7;

const chartData = [
  { date: '2026-03-15', webWizard: 198, mobileApp: 96 },
  { date: '2026-03-16', webWizard: 176, mobileApp: 82 },
  { date: '2026-03-17', webWizard: 184, mobileApp: 88 },
  { date: '2026-03-18', webWizard: 170, mobileApp: 80 },
  { date: '2026-03-19', webWizard: 188, mobileApp: 90 },
  { date: '2026-03-20', webWizard: 180, mobileApp: 85 },
  { date: '2026-03-21', webWizard: 192, mobileApp: 92 },
  { date: '2026-03-22', webWizard: 172, mobileApp: 78 },
  { date: '2026-03-23', webWizard: 166, mobileApp: 74 },
  { date: '2026-03-24', webWizard: 174, mobileApp: 79 },
  { date: '2026-03-25', webWizard: 158, mobileApp: 72 },
  { date: '2026-03-26', webWizard: 168, mobileApp: 76 },
  { date: '2026-03-27', webWizard: 152, mobileApp: 70 },
  { date: '2026-03-28', webWizard: 160, mobileApp: 74 },
  { date: '2026-03-29', webWizard: 146, mobileApp: 68 },
  { date: '2026-03-30', webWizard: 154, mobileApp: 71 },
  { date: '2026-03-31', webWizard: 142, mobileApp: 65 },
  { date: '2026-04-01', webWizard: 140, mobileApp: 63 },
  { date: '2026-04-02', webWizard: 132, mobileApp: 59 },
  { date: '2026-04-03', webWizard: 124, mobileApp: 56 },
  { date: '2026-04-04', webWizard: 128, mobileApp: 58 },
  { date: '2026-04-05', webWizard: 116, mobileApp: 52 },
  { date: '2026-04-06', webWizard: 84, mobileApp: 40 },
  { date: '2026-04-07', webWizard: 82, mobileApp: 38 },
  { date: '2026-04-08', webWizard: 96, mobileApp: 46 },
  { date: '2026-04-09', webWizard: 92, mobileApp: 69 },
  { date: '2026-04-10', webWizard: 96, mobileApp: 62 },
  { date: '2026-04-11', webWizard: 112, mobileApp: 75 },
  { date: '2026-04-12', webWizard: 101, mobileApp: 77 },
  { date: '2026-04-13', webWizard: 112, mobileApp: 78 }
];

const chartRows = chartData.slice(-VISIBLE_DAYS);

function rowTotal(row) {
  return row.webWizard + row.mobileApp;
}

function growthPctForWindow(rows) {
  const first = rows[0];
  if (!first) return 0;
  const last = rows.at(-1);
  if (!last) return 0;
  const a = rowTotal(first);
  const b = rowTotal(last);
  if (!a) return 0;
  return ((b - a) / a) * 100;
}

const growthPctNum = growthPctForWindow(chartRows);

const chartConfig = {
  webWizard: {
    label: 'AI Wizard',
    color: 'var(--chart-2)'
  },
  mobileApp: {
    label: 'Mobile Web',
    color: 'var(--chart-1)'
  }
};

export function ChannelSalesChart() {
  const chartUid = useId().replace(/:/g, '');
  const idLineGlow = `channel-sales-line-glow-${chartUid}`;

  return (
    <DashboardCard className="gap-0 md:col-span-2">
      <CardHeader>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Travel Inflow Channels</CardTitle>
            <Delta value={growthPctNum} variant="badge">
              <DeltaIcon variant="trend" />
              <DeltaValue />
            </Delta>
          </div>
          <CardDescription>
            Daily generation distribution by client platform, last {VISIBLE_DAYS} days.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer className="aspect-auto h-60 w-full p-0 md:h-80" config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartRows}
            margin={{
              left: 12,
              right: 12,
              top: 8
            }}
          >
            <CartesianGrid className="stroke-border" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              interval={0}
              tickFormatter={(value) => formatDate(String(value), 'day-month')}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
            <defs>
              <filter height="140%" id={idLineGlow} width="140%" x="-20%" y="-20%">
                <feGaussianBlur result="blur" stdDeviation="10" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <Line
              dataKey="mobileApp"
              dot={false}
              filter={`url(#${idLineGlow})`}
              stroke="var(--color-online)"
              strokeWidth={2}
              type="step"
            />
            <Line
              dataKey="webWizard"
              dot={false}
              filter={`url(#${idLineGlow})`}
              stroke="var(--color-retail)"
              strokeWidth={2}
              type="step"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </DashboardCard>
  );
}
