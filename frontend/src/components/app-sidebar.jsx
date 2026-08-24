import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { navGroups } from '@/components/app-shared';
import { NavGroup } from '@/components/nav-group';
import { NavUser } from '@/components/nav-user';

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

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
