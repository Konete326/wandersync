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
  User,
  Globe,
  Navigation,
  Building,
  Car,
  Plane,
  MessageSquare
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
      },
      {
        title: 'Community Lounge',
        path: '/admin/community',
        icon: <MessageSquare className="size-4" />
      }
    ]
  },
  {
    label: 'Travel Catalog & Fleet',
    items: [
      {
        title: 'Countries & Cities',
        path: '/admin/countries',
        icon: <Globe className="size-4" />
      },
      {
        title: 'Tourist Spots',
        path: '/admin/spots',
        icon: <Navigation className="size-4" />
      },
      {
        title: 'Hotels & Stays',
        path: '/admin/hotels',
        icon: <Building className="size-4" />
      },
      {
        title: 'Vehicles & Fleet',
        path: '/admin/vehicles',
        icon: <Car className="size-4" />
      },
      {
        title: 'Flights & Airlines',
        path: '/admin/flights',
        icon: <Plane className="size-4" />
      },
      {
        title: 'Destinations & Media',
        path: '/admin/media',
        icon: <Image className="size-4" />
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
