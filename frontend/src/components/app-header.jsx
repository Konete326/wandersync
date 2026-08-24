import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { DecorIcon } from '@/components/decor-icon';
import { AppBreadcrumbs } from '@/components/app-breadcrumbs';
import { navLinks } from '@/components/app-shared';
import { CustomSidebarTrigger } from '@/components/custom-sidebar-trigger';
import { NavUser } from '@/components/nav-user';
import { History, Bell } from 'lucide-react';

export function AppHeader() {
  const location = useLocation();
  const activeItem = navLinks.find(
    (item) => item.path === location.pathname
  ) || { title: 'Dashboard', icon: null };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 md:px-6',
        'bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50'
      )}
    >
      <DecorIcon className="hidden md:block" position="bottom-left" />
      <div className="flex items-center gap-3">
        <CustomSidebarTrigger />
        <Separator
          className="mr-2 h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <AppBreadcrumbs page={activeItem} />
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          to="/admin/changelog"
          className="flex items-center justify-center size-8 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Changelog"
        >
          <History className="size-4" />
        </Link>
        <Link
          to="/admin/notifications"
          className="relative flex items-center justify-center size-8 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-cyan-400"></span>
        </Link>
        <Separator
          className="h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <NavUser />
      </div>
    </header>
  );
}
