"use client";

import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Settings,
  User,
  HelpCircle,
  LogOut,
  Menu,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Receipt,
  Crown,
  Shield,
  DollarSign,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from './ThemeToggle';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils'; // Importando cn para classes condicionais

// Removendo a prop 'children' da assinatura do componente
export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isAdmin } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Transações', icon: DollarSign, path: '/transactions' },
    { name: 'Contas', icon: Wallet, path: '/accounts' },
    { name: 'Contas a Pagar', icon: Receipt, path: '/bills' },
    { name: 'Lista de Compras', icon: ShoppingCart, path: '/shopping-list' },
    { name: 'Orçamento', icon: TrendingUp, path: '/budget' },
    { name: 'Planos', icon: Crown, path: '/pricing' },
    { name: 'Configurações', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNavItem = { name: 'Admin', icon: Shield, path: '/admin' };
  const fullNavItems = isAdmin ? [...navItems, adminNavItem] : navItems;

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    // Estilo para o modo minimizado (apenas ícone)
    const iconOnlyClasses = "h-10 w-10 p-0 justify-center"; // Adicionado justify-center
    // Estilo para o modo expandido (ícone + texto)
    const expandedClasses = "w-full justify-start h-10 px-3";

    return (
      <Link
        key={item.name}
        to={item.path}
        title={item.name}
        className={cn(
          "flex items-center rounded-md transition-colors duration-200",
          isSidebarOpen ? expandedClasses : iconOnlyClasses,
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'text-sidebar-foreground hover:bg-sidebar-accent'
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", isSidebarOpen ? 'mr-3' : '')} />
        {isSidebarOpen && <span className="truncate">{item.name}</span>}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold">FinanBoard</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {fullNavItems.map(renderNavItem)}
      </nav>
      <div className="p-4 border-t border-sidebar-border relative">
        <div
          className="flex items-center space-x-3 cursor-pointer" // Alterado de space-x-2 para space-x-3
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{user?.name || 'Usuário'}</span>
          </div>
          {isProfileMenuOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
        </div>
        {isProfileMenuOpen && (
          <div className="absolute left-4 right-4 bottom-full mb-2 bg-sidebar-accent rounded-md shadow-lg py-1 z-10">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm hover:bg-sidebar-primary"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              Perfil
            </Link>
            <Link
              to="/help"
              className="block px-4 py-2 text-sm hover:bg-sidebar-primary"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              Ajuda
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsProfileMenuOpen(false);
              }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-background">
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20' // Aumentei a largura minimizada para 20 (80px) para melhor visualização do ícone
        }`}
      >
        <div className="flex flex-col h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border">
          <div className={cn("p-4 border-b flex items-center", isSidebarOpen ? 'justify-between' : 'justify-center')}>
            <h1 className={`text-xl font-bold ${isSidebarOpen ? '' : 'hidden'}`}>FinanBoard</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {fullNavItems.map(renderNavItem)}
          </nav>
          <div className="p-4 border-t relative border-sidebar-border">
            <div
              className={`flex items-center space-x-3 cursor-pointer ${isSidebarOpen ? 'justify-start' : 'justify-center'}`} // Alterado de space-x-2 para space-x-3
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{user?.name || 'Usuário'}</span>
                </div>
              )}
              {isSidebarOpen && (isProfileMenuOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />)}
            </div>
            {isProfileMenuOpen && isSidebarOpen && (
              <div className="absolute left-4 right-4 bottom-full mb-2 bg-sidebar-accent rounded-md shadow-lg py-1 z-10">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-sidebar-primary"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Perfil
                </Link>
                <Link
                  to="/help"
                  className="block px-4 py-2 text-sm hover:bg-sidebar-primary"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Ajuda
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center dark:bg-card">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {fullNavItems.find(item => item.path === location.pathname)?.name || 'Página'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </header>
        
        {/* Main content - Usando Outlet para renderizar a rota filha */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};