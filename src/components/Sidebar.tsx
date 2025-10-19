"use client";

import { Home, Repeat2, Receipt, Wallet, ShoppingCart, TrendingUp, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/transactions', icon: Repeat2, label: 'Transações' },
  { href: '/bills', icon: Receipt, label: 'Contas a Pagar' },
  { href: '/shopping', icon: ShoppingCart, label: 'Lista de Compras' }, // NOVO ITEM
  { href: '/accounts', icon: Wallet, label: 'Contas' },
  { href: '/budget', icon: TrendingUp, label: 'Orçamento' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">FinançasApp</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start text-lg h-12"
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Link href="/settings" passHref>
          <Button variant="ghost" className="w-full justify-start text-lg h-12 mb-2">
            <Settings className="h-5 w-5 mr-3" />
            Configurações
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start text-lg h-12 text-red-500 hover:text-red-600" onClick={signOut}>
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;