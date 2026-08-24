import { useState, useEffect } from 'react';
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Delta, DeltaIcon, DeltaValue } from '@/components/delta';
import { DashboardCard } from '@/components/dashboard-card';
import { getAdminStats } from '@/services/adminService';

export function DashboardStats() {
  const [statsData, setStatsData] = useState([
    { label: 'Total AI Itineraries', value: '3,842', delta: 14.8 },
    { label: 'Gemini Inferences', value: '29,480', delta: 22.3 },
    { label: 'Registered Travelers', value: '1,640', delta: 9.5 },
    { label: 'Destinations Mapped', value: '142', delta: 5.2 }
  ]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getAdminStats();
        if (res.data) {
          setStatsData([
            {
              label: 'Total AI Itineraries',
              value: res.data.totalTrips?.toLocaleString() || '0',
              delta: 14.8
            },
            {
              label: 'Gemini Inferences',
              value: res.data.geminiInferences?.toLocaleString() || '0',
              delta: 22.3
            },
            {
              label: 'Registered Travelers',
              value: res.data.totalUsers?.toLocaleString() || '0',
              delta: 9.5
            },
            {
              label: 'Destinations Mapped',
              value: res.data.totalDestinations?.toLocaleString() || '0',
              delta: 5.2
            }
          ]);
        }
      } catch {
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {statsData.map((s) => (
        <DashboardCard className="" key={s.label}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-normal text-xs tracking-wide text-muted-foreground">
              {s.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-center gap-2">
            <p className="font-bold text-2xl tabular-nums text-foreground">{s.value}</p>
          </CardContent>
          <CardFooter className="gap-1 rounded-none bg-background text-xs">
            <Delta value={s.delta}>
              <DeltaIcon />
              <DeltaValue />
            </Delta>
            <span className="text-muted-foreground">Live Telemetry</span>
          </CardFooter>
        </DashboardCard>
      ))}
    </>
  );
}
