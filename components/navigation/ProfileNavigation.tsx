'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getClientPaymentConfig } from '@/lib/payment/payment-config';
import { 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  Bell,
  LogOut
} from 'lucide-react';

interface ProfileNavigationProps {
  className?: string;
}

const navigationItems = [
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Settings',
    href: '/profile/settings',
    icon: Settings,
  },
  {
    name: 'Security',
    href: '/profile/security',
    icon: Shield,
  },
  {
    name: 'Notifications',
    href: '/profile/notifications',
    icon: Bell,
  },
];

export default function ProfileNavigation({ className }: ProfileNavigationProps) {
  const pathname = usePathname();
  const paymentConfig = getClientPaymentConfig();

  // Add subscription link if payments are enabled
  const allNavigationItems = [
    ...navigationItems,
    ...(paymentConfig.enabled ? [{
      name: 'Subscription',
      href: '/profile/subscription',
      icon: CreditCard,
    }] : []),
  ];

  return (
    <nav className={cn('space-y-1', className)}>
      {allNavigationItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}