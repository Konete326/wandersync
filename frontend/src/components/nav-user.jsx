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
import { UserIcon, SettingsIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function NavUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            className="flex items-center justify-center size-8 rounded-full border border-border bg-card hover:ring-2 hover:ring-cyan-500/40 transition-all cursor-pointer outline-none"
            aria-label="User account menu"
          />
        }
      >
        <Avatar className="size-full">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-secondary text-foreground text-xs font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 bg-card border border-border text-foreground shadow-2xl p-1.5 rounded-xl"
      >
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40 border border-border/60 mb-1">
          <Avatar className="size-10 border border-border shrink-0">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-secondary text-foreground font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground truncate">{displayName}</span>
            <span className="text-[11px] text-muted-foreground truncate">{displayEmail}</span>
            <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider mt-0.5">
              {user?.role || 'Admin'}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-border my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => navigate('/admin/profile')}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-lg hover:bg-secondary transition-colors"
          >
            <UserIcon className="size-4 text-cyan-400" />
            <span>Admin Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-lg hover:bg-secondary transition-colors"
          >
            <SettingsIcon className="size-4 text-cyan-400" />
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
