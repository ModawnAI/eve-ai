'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  House,
  Users,
  FileText,
  Folder,
  Robot,
  Gear,
  SignOut,
  CaretLeft,
  CaretRight,
  Plugs,
  ChartBar,
  UsersThree,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string; weight?: 'regular' | 'fill' }>;
}

const navItems: NavItem[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: House },
  { href: '/dashboard/clients', labelKey: 'clients', icon: Users },
  { href: '/dashboard/policies', labelKey: 'policies', icon: FileText },
  { href: '/dashboard/documents', labelKey: 'documents', icon: Folder },
  { href: '/dashboard/ai', labelKey: 'ai', icon: Robot },
  { href: '/dashboard/reports', labelKey: 'reports', icon: ChartBar },
  { href: '/dashboard/integrations', labelKey: 'integrations', icon: Plugs },
  { href: '/dashboard/admin/users', labelKey: 'admin', icon: UsersThree },
];

const bottomNavItems: NavItem[] = [
  { href: '/dashboard/settings', labelKey: 'settings', icon: Gear },
];

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon
          className="h-5 w-5 shrink-0"
          weight={active ? 'fill' : 'regular'}
        />
        {!collapsed && <span>{t(item.labelKey)}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {t(item.labelKey)}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex h-screen flex-col bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center px-4',
            collapsed ? 'justify-center' : 'gap-2'
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            E
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold">EVE AI</span>
          )}
        </div>

        {/* Main Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="px-3 py-4">
          <nav className="flex flex-col gap-1">
            {bottomNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center px-2"
                  >
                    <SignOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t('signOut')}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 px-3 text-muted-foreground"
              >
                <SignOut className="h-5 w-5" />
                <span>{t('signOut')}</span>
              </Button>
            )}
          </nav>

          <Separator className="my-4" />

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapsedChange?.(!collapsed)}
            className={cn(
              'w-full',
              collapsed ? 'justify-center px-2' : 'justify-between px-3'
            )}
          >
            {!collapsed && <span className="text-xs text-muted-foreground">Collapse</span>}
            {collapsed ? (
              <CaretRight className="h-4 w-4" />
            ) : (
              <CaretLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
