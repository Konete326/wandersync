import { BillingHealth } from '@/components/billing-health';
import { ChannelSalesChart } from '@/components/channel-sales-chart';
import { DashboardActivity } from '@/components/dashboard-activity';
import { DashboardInvoices } from '@/components/dashboard-invoices';
import { NetRevenueChart } from '@/components/net-revenue-chart';
import { DashboardStats } from '@/components/stats';
import { LayoutGrid } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="w-full space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <LayoutGrid className="size-3.5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-heading">
              WanderSync Command Center
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Global AI travel generations, Gemini model performance, and traveler activity telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <span className="size-1.5 rounded-full bg-orange-400 animate-pulse"></span>
            Maestro Engine Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px bg-border p-px md:grid-cols-2 lg:grid-cols-4 rounded-2xl overflow-hidden border border-border">
        <DashboardStats />
        <NetRevenueChart />
        <ChannelSalesChart />
        <DashboardInvoices />
        <BillingHealth />
        <DashboardActivity />
      </div>
    </div>
  );
}
