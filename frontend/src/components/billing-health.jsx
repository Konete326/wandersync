import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { DashboardCard } from '@/components/dashboard-card';
import { Sparkles, ArrowRightIcon } from 'lucide-react';

export function BillingHealth() {
  return (
    <DashboardCard className="gap-0">
      <CardHeader className="border-b">
        <CardTitle className="text-balance text-base">Cloud & AI Health</CardTitle>
        <CardDescription className="text-pretty">
          All external services operating at peak performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full items-center px-0">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
              <Sparkles aria-hidden="true" className="size-6" />
            </EmptyMedia>
            <EmptyTitle>100% Systems Operational</EmptyTitle>
            <EmptyDescription className="text-xs">
              Gemini 2.5 Flash, Cloudinary CDN, MongoDB M0, and Open-Meteo latency under 120ms.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant="ghost" className="cursor-pointer">
              <Link to="/admin/settings">
                <span>View Engine Config</span>
                <ArrowRightIcon aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </DashboardCard>
  );
}
