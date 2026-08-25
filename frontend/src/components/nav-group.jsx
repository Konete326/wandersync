import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar';
import { ChevronDown, ChevronRightIcon } from 'lucide-react';

export function NavGroup({ label, icon, items, defaultOpen = false }) {
  const location = useLocation();
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const hasActiveChild = items.some((item) => {
    if (location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))) {
      return true;
    }
    if (item.subItems?.some((sub) => location.pathname === sub.path)) {
      return true;
    }
    return false;
  });

  const [isOpen, setIsOpen] = useState(defaultOpen || hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  const groupIcon = icon || items[0]?.icon;

  const handleCollapsedGroupClick = () => {
    setOpen(true);
    setIsOpen(true);
  };

  if (isCollapsed) {
    return (
      <SidebarGroup className="p-0 py-1 flex items-center justify-center">
        <SidebarMenu className="w-full flex items-center justify-center">
          <SidebarMenuItem className="flex justify-center w-full">
            <SidebarMenuButton
              isActive={hasActiveChild}
              tooltip={`${label} (Click to open)`}
              onClick={handleCollapsedGroupClick}
              className="size-9 justify-center cursor-pointer transition-all hover:border-orange-500/40"
            >
              {groupIcon}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="py-1">
      {label && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center justify-between w-full px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer group select-none rounded-lg hover:bg-secondary/40"
        >
          <span className="truncate">{label}</span>
          <ChevronDown
            className={`size-3 text-muted-foreground/70 transition-transform duration-200 ${
              isOpen ? 'rotate-0' : '-rotate-90'
            }`}
          />
        </button>
      )}

      {isOpen && (
        <SidebarMenu className="mt-0.5 space-y-0.5 animate-in fade-in duration-150">
          {items.map((item) => {
            const isItemActive =
              location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));

            if (!item.subItems?.length) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isItemActive}
                    tooltip={item.title}
                    render={<Link to={item.path} />}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            if (isCollapsed) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isItemActive}
                    tooltip={item.title}
                    render={<Link to={item.path || item.subItems[0]?.path || '/admin'} />}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible
                className="group/collapsible"
                key={item.title}
                render={<SidebarMenuItem />}
              >
                <CollapsibleTrigger render={<SidebarMenuButton isActive={isItemActive} tooltip={item.title} />}>
                  {item.icon}
                  <span>{item.title}</span>
                  <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.subItems.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={isSubActive}
                            render={<Link to={subItem.path} />}
                          >
                            {subItem.icon}
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}
