import {
  LayoutGrid,
  Compass,
  Users,
  Sparkles,
  Receipt,
  Image,
  Bell,
  History,
  Settings,
  User
} from 'lucide-react';

export const navGroups = [
  {
    label: 'Core Operations',
    items: [
      {
        title: 'Dashboard',
        path: '/admin',
        icon: <LayoutGrid className="size-4" />
      },
      {
        title: 'Trips Maestro',
        path: '/admin/trips',
        icon: <Compass className="size-4" />
      },
      {
        title: 'Travelers',
        path: '/admin/users',
        icon: <Users className="size-4" />
      }
    ]
  },
  {
    label: 'AI & Intelligence',
    items: [
      {
        title: 'Gemini Analytics',
        path: '/admin/ai-analytics',
        icon: <Sparkles className="size-4" />
      },
      {
        title: 'Platform Expenses',
        path: '/admin/expenses',
        icon: <Receipt className="size-4" />
      },
      {
        title: 'Media CDN',
        path: '/admin/media',
        icon: <Image className="size-4" />
      }
    ]
  },
  {
    label: 'System & Control',
    items: [
      {
        title: 'Notifications',
        path: '/admin/notifications',
        icon: <Bell className="size-4" />
      },
      {
        title: 'Changelog',
        path: '/admin/changelog',
        icon: <History className="size-4" />
      },
      {
        title: 'Settings',
        path: '/admin/settings',
        icon: <Settings className="size-4" />
      },
      {
        title: 'Admin Profile',
        path: '/admin/profile',
        icon: <User className="size-4" />
      }
    ]
  }
];

export const footerNavLinks = [];

export const navLinks = navGroups.flatMap((group) =>
  group.items.flatMap((item) =>
    item.subItems?.length ? [item, ...item.subItems] : [item]
  )
);
