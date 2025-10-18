"use client";

import { usePathname } from 'next/navigation';
import { Home, KanbanSquare, Settings, ShoppingCart } from 'lucide-react';
import { SidebarLink } from './SidebarLink';
import { Separator } from './ui/separator';

const links = [
  { href: '/', icon: <Home size={20} />, label: 'Home' },
  { href: '/kanban', icon: <KanbanSquare size={20} />, label: 'Kanban Board' },
  { href: '/shopping-list', icon: <ShoppingCart size={20} />, label: 'Shopping List' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen p-4 border-r bg-card text-card-foreground">
      <div className="flex items-center mb-6">
        <KanbanSquare className="w-8 h-8 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">TaskFlow</h1>
      </div>
      <nav className="space-y-2">
        {links.map(link => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            active={pathname === link.href}
          >
            {link.label}
          </SidebarLink>
        ))}
      </nav>
      <Separator className="my-4" />
      <div className="absolute bottom-4">
        <SidebarLink href="/settings" icon={<Settings size={20} />} active={pathname === '/settings'}>
          Settings
        </SidebarLink>
      </div>
    </aside>
  );
};