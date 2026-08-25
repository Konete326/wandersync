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
        'sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b border-border px-4 md:px-6',
        'bg-[#09090b]/95 backdrop-blur-md supports-backdrop-filter:bg-[#09090b]/80 shadow-xs'
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
          className="flex items-center justify-center size-8 rounded-full border border-border bg-[#121215] hover:bg-[#18181b] hover:border-orange-500/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
          title="Changelog"
        >
          <History className="size-4" />
        </Link>
        <Link
          to="/admin/notifications"
          className="relative flex items-center justify-center size-8 rounded-full border border-border bg-[#121215] hover:bg-[#18181b] hover:border-orange-500/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
          title="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-orange-500"></span>
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
