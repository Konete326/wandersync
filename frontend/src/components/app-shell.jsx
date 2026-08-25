import { cn } from '@/lib/utils';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';

export function AppShell({ children }) {
  return (
    <SidebarProvider className="w-full min-h-screen bg-background">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background min-h-screen">
        <AppHeader />
        <main className={cn(
          'flex flex-1 flex-col w-full p-4 sm:p-6 lg:p-8',
          'min-w-0'
        )}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
