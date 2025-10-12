"use client";

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  User,
  HelpCircle,
  LogOut,
  Menu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from './ThemeToggle'; // Importar ThemeToggle

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Quadros', icon: ClipboardList, path: '/boards' },
  { name: 'Configurações', icon: Settings, path: '/settings' },
  { name: 'Perfil', icon: User, path: '/profile' },
  { name: 'Ajuda', icon: HelpCircle, path: '/help' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Keep true for initial expanded state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold">Kanban</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center p-2 rounded-md hover:bg-sidebar-accent ${
              location.pathname === item.path ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border relative">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        >
          <Avatar>
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate flex-1">{user?.name || 'Usuário'}</span>
          {isProfileMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
            <button
              onClick={handleLogout}
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
    <div className="flex h-screen bg-gray-100 dark:bg-background"> {/* Adicionado dark:bg-background */}
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col transition-all duration-300 w-64`}
      >
        <div className="flex flex-col h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border">
          <div className="p-4 border-b flex items-center justify-between border-sidebar-border">
            <h1 className="text-2xl font-bold">Kanban</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center p-2 rounded-md hover:bg-sidebar-accent ${
                  location.pathname === item.path ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                }`}
                title={item.name}
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t relative border-sidebar-border">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate flex-1">{user?.name || 'Usuário'}</span>
              {isProfileMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                <button
                  onClick={handleLogout}
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
        <header className="bg-white shadow-sm p-4 flex justify-between items-center dark:bg-gray-800">
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
            {navItems.find(item => item.path === location.pathname)?.name || 'Página'}
          </h2>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};