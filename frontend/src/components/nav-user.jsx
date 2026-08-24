import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { UserIcon, SettingsIcon, LogOutIcon, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function NavUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const displayName = user?.name || 'Administrator';
  const displayEmail = user?.email || 'admin@wandersync.com';
  const avatarUrl = user?.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={`flex items-center gap-2.5 w-full rounded-xl p-1.5 hover:bg-secondary/60 transition-all cursor-pointer outline-none border border-transparent hover:border-border ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
            aria-label="User account menu"
          />
        }
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="size-8 rounded-lg border border-orange-500/30 shrink-0">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col text-left min-w-0 flex-1">
              <span className="font-bold text-xs text-foreground truncate">{displayName}</span>
              <span className="text-[10px] text-muted-foreground truncate">{displayEmail}</span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isCollapsed ? "center" : "end"}
        side={isCollapsed ? "right" : "top"}
        sideOffset={8}
        className="w-60 bg-[#121215] border border-border/80 text-foreground shadow-2xl p-1.5 rounded-xl font-sans"
      >
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40 border border-border/60 mb-1">
          <Avatar className="size-9 rounded-lg border border-orange-500/30 shrink-0">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-secondary text-foreground font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs text-foreground truncate">{displayName}</span>
            <span className="text-[11px] text-muted-foreground truncate">{displayEmail}</span>
            <span className="text-[9px] font-mono text-orange-400 font-bold uppercase tracking-wider mt-0.5">
              {user?.role || 'Admin'}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-border my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => navigate('/admin/profile')}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-lg hover:bg-secondary text-zinc-300 hover:text-foreground transition-colors"
          >
            <UserIcon className="size-4 text-orange-400" />
            <span>Admin Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-lg hover:bg-secondary text-zinc-300 hover:text-foreground transition-colors"
          >
            <SettingsIcon className="size-4 text-orange-400" />
            <span>System Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOutIcon className="size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
