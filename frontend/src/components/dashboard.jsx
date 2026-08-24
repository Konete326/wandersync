import { BillingHealth } from '@/components/billing-health';
import { ChannelSalesChart } from '@/components/channel-sales-chart';
import { DashboardActivity } from '@/components/dashboard-activity';
import { DashboardInvoices } from '@/components/dashboard-invoices';
import { NetRevenueChart } from '@/components/net-revenue-chart';
import { DashboardStats } from '@/components/stats';

export function Dashboard() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            WanderSync Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global AI travel generations, Gemini model performance, and traveler activity telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
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
