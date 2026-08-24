import { useState, useEffect } from 'react';
import { Bar, BarChart, XAxis } from 'recharts';
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
  count: {
    label: 'Itineraries',
    color: 'var(--chart-2)'
  }
};

function CustomGradientBar(props) {
  const {
    fill = '#f97316',
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    dataKey = 'count',
    index = 0
  } = props;
  const gid = `gradient-bar-${String(dataKey)}-${index}`;

  return (
    <>
      <rect
        fill={`url(#${gid})`}
        height={height}
        stroke="none"
        width={width}
        x={x}
        y={y}
      />
      <rect fill={fill} height={2} stroke="none" width={width} x={x} y={y} />
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#ea580c" stopOpacity={0.1} />
        </linearGradient>
      </defs>
    </>
  );
}

export function NetRevenueChart() {
  const [chartData, setChartData] = useState([
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 }
  ]);
  const [growthPct, setGrowthPct] = useState(15.4);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getAdminStats();
        if (res.data?.dailyGenerations) {
          setChartData(res.data.dailyGenerations);
          const first = res.data.dailyGenerations[0]?.count || 1;
          const last = res.data.dailyGenerations.at(-1)?.count || first;
          setGrowthPct(Number((((last - first) / Math.max(first, 1)) * 100).toFixed(1)));
        }
      } catch {
      }
    };
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardCard className="gap-0 md:col-span-2">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>AI Itinerary Generation Volume</CardTitle>
          <Delta value={Number(growthPct)} variant="badge">
            <DeltaIcon variant="trend" />
            <DeltaValue />
          </Delta>
        </div>
        <CardDescription>Daily Gemini AI itineraries generated, last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="aspect-auto h-60 w-full md:h-80" config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              axisLine={false}
              dataKey="day"
              interval={0}
              tickFormatter={(value) => String(value)}
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
            <Bar dataKey="count" fill="#f97316" shape={<CustomGradientBar />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </DashboardCard>
  );
}
