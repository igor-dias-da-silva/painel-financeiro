"use client";

import { usePathname } from 'next/navigation';
import { Home, KanbanSquare, Settings, ShoppingCart } from 'lucide-react';
import { SidebarLink } from './SidebarLink';
import { Separator } from './ui/separator';

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-background border-r fixed top-0 left-0 flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary">TaskFlow</h1>
      </div>
      <nav className="flex flex-col p-4 space-y-2">
        <SidebarLink href="/" icon={<Home />} active={pathname === '/'}>
          Início
        </SidebarLink>
        <SidebarLink href="/boards" icon={<KanbanSquare />} active={pathname.startsWith('/boards')}>
          Quadros
        </SidebarLink>
        <SidebarLink href="/shopping-list" icon={<ShoppingCart />} active={pathname.startsWith('/shopping-list')}>
          Lista de Compras
        </SidebarLink>
      </nav>
      <div className="mt-auto p-4">
        <Separator className="mb-4" />
        <SidebarLink href="/settings" icon={<Settings />} active={pathname === '/settings'}>
          Configurações
        </SidebarLink>
      </div>
    </aside>
  );
};