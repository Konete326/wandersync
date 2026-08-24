import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { navGroups } from '@/components/app-shared';
import { NavGroup } from '@/components/nav-group';

export function AppSidebar() {
  return (
    <Sidebar
      className={cn(
        '*:data-[slot=sidebar-inner]:bg-background',
        '*:data-[slot=sidebar-inner]:dark:bg-[radial-gradient(60%_18%_at_10%_0%,--theme(--color-foreground/.08),transparent)]',
        '**:data-[slot=sidebar-menu-button]:[&>span]:text-foreground/75'
      )}
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="h-14 justify-center border-b px-2">
        <SidebarMenuButton render={<Link to="/admin" />}>
          <LogoIcon />
          <span className="font-bold text-foreground tracking-tight">WanderSync</span>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group, index) => (
          <NavGroup key={`sidebar-group-${index}`} {...group} />
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-0 p-0 border-t">
        <div className="px-4 py-3 transition-opacity group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0">
          <p className="text-nowrap text-[11px] font-medium text-muted-foreground">
            © 2026 Elite Dev
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
