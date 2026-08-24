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

const dailyGenerations = [
  { day: 'Mon', count: 320 },
  { day: 'Tue', count: 410 },
  { day: 'Wed', count: 490 },
  { day: 'Thu', count: 530 },
  { day: 'Fri', count: 680 },
  { day: 'Sat', count: 820 },
  { day: 'Sun', count: 910 }
];

const firstDay = dailyGenerations[0].count;
const lastDay = dailyGenerations.at(-1)?.count ?? firstDay;
const growthPct = (((lastDay - firstDay) / firstDay) * 100).toFixed(1);

const chartConfig = {
  count: {
    label: 'Itineraries',
    color: 'var(--chart-2)'
  }
};

function CustomGradientBar(props) {
  const {
    fill,
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
          <stop offset="0%" stopColor={fill} stopOpacity={0.5} />
          <stop offset="100%" stopColor={fill} stopOpacity={0} />
        </linearGradient>
      </defs>
    </>
  );
}

export function NetRevenueChart() {
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
          <BarChart accessibilityLayer data={dailyGenerations}>
            <XAxis
              axisLine={false}
              dataKey="day"
              interval={0}
              tickFormatter={(value) => String(value)}
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
            <Bar dataKey="count" fill="var(--color-sales)" shape={<CustomGradientBar />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </DashboardCard>
  );
}
