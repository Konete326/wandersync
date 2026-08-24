import { useState } from 'react';
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

export function NavGroup({ label, items, defaultOpen = true }) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <SidebarGroup className="py-1 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-1">
      {label && !isCollapsed && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center justify-between w-full px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer group select-none rounded-lg hover:bg-secondary/40 group-data-[collapsible=icon]:hidden"
        >
          <span className="truncate">{label}</span>
          <ChevronDown
            className={`size-3 text-muted-foreground/70 transition-transform duration-200 ${
              isOpen ? 'rotate-0' : '-rotate-90'
            }`}
          />
        </button>
      )}

      {(isOpen || isCollapsed) && (
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
