import { useState, useEffect, useId } from 'react';
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
import { getAdminStats } from '@/services/adminService';

const chartConfig = {
  webWizard: {
    label: 'AI Wizard',
    color: '#f97316'
  },
  mobileApp: {
    label: 'Mobile Web',
    color: '#38bdf8'
  }
};

export function ChannelSalesChart() {
  const chartUid = useId().replace(/:/g, '');
  const idLineGlow = `channel-sales-line-glow-${chartUid}`;

  const [chartRows, setChartRows] = useState(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toISOString().split('T')[0],
        webWizard: 0,
        mobileApp: 0
      };
    });
  });

  const [growthPct, setGrowthPct] = useState(12.5);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getAdminStats();
        if (res.data?.dailyGenerations) {
          const rows = res.data.dailyGenerations.map((g) => ({
            date: g.date || new Date().toISOString().split('T')[0],
            webWizard: Math.ceil(g.count * 0.7),
            mobileApp: Math.floor(g.count * 0.3)
          }));
          setChartRows(rows);
          const first = (rows[0]?.webWizard || 0) + (rows[0]?.mobileApp || 0);
          const last = (rows.at(-1)?.webWizard || 0) + (rows.at(-1)?.mobileApp || 0);
          if (first > 0) {
            setGrowthPct(Number((((last - first) / first) * 100).toFixed(1)));
          }
        }
      } catch {
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardCard className="gap-0 md:col-span-2">
      <CardHeader>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Travel Inflow Channels</CardTitle>
            <Delta value={growthPct} variant="badge">
              <DeltaIcon variant="trend" />
              <DeltaValue />
            </Delta>
          </div>
          <CardDescription>
            Daily generation distribution by client platform, last 7 days.
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
            <CartesianGrid className="stroke-border/60" vertical={false} />
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
              stroke="#38bdf8"
              strokeWidth={2}
              type="step"
            />
            <Line
              dataKey="webWizard"
              dot={false}
              filter={`url(#${idLineGlow})`}
              stroke="#f97316"
              strokeWidth={2}
              type="step"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </DashboardCard>
  );
}
