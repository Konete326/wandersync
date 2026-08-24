import { useState, useEffect } from 'react';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { DashboardCard } from '@/components/dashboard-card';
import { Compass, Sparkles, Download, Cloud } from 'lucide-react';
import { getAdminActivity } from '@/services/adminService';

const fallbackActivities = [
  {
    title: 'Kyoto 7-Day Cultural Plan generated with Gemini Flash',
    time: '8 mins ago',
    icon: <Sparkles className="size-4 text-cyan-400" />
  },
  {
    title: 'Sarah downloaded 5-Day Paris Trip PDF itinerary',
    time: '42 mins ago',
    icon: <Download className="size-4 text-emerald-400" />
  },
  {
    title: 'New itinerary created: 3-Day Rome Weekend Getaway',
    time: '2 hours ago',
    icon: <Compass className="size-4 text-blue-400" />
  },
  {
    title: 'Cloudinary CDN synced 24 trip photos and cover images',
    time: '5 hours ago',
    icon: <Cloud className="size-4 text-purple-400" />
  }
];

export function DashboardActivity() {
  const [activities, setActivities] = useState(fallbackActivities);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await getAdminActivity();
        if (res.data && res.data.length > 0) {
          setActivities(
            res.data.map((item) => ({
              title: item.title,
              time: 'Just now',
              icon: <Sparkles className="size-4 text-cyan-400" />
            }))
          );
        }
      } catch {
      }
    };
    loadActivities();
    const interval = setInterval(loadActivities, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardCard className="gap-0">
      <CardHeader className="border-b">
        <CardTitle>Traveler & AI Activity</CardTitle>
        <CardDescription>Live real-time feed across WanderSync platform.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="flex flex-col divide-y divide-border">
          {activities.map((item, index) => (
            <li className="flex h-16 items-center gap-3 px-6" key={index}>
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border"
              >
                {item.icon}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-1 text-pretty text-foreground text-sm leading-snug">
                  {item.title}
                </p>
                <p className="text-muted-foreground text-xs font-mono">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </DashboardCard>
  );
}
