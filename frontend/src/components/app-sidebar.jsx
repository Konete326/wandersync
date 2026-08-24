import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from '@/components/ui/sidebar';
import { navGroups } from '@/components/app-shared';
import { NavGroup } from '@/components/nav-group';
import { NavUser } from '@/components/nav-user';

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

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
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-2">
        <Link
          to="/admin"
          className={cn(
            "flex items-center gap-2.5 rounded-xl transition-all hover:bg-secondary/60 cursor-pointer",
            isCollapsed ? "justify-center p-1" : "px-2 py-1.5"
          )}
          title="WanderSync Admin Command Center"
        >
          <LogoIcon className={cn("object-contain rounded-lg shrink-0", isCollapsed ? "size-8" : "size-7")} />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground tracking-tight leading-tight">
                WanderSync
              </span>
              <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">
                Admin Hub
              </span>
            </div>
          )}
        </Link>
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
