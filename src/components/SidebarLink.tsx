"use client";

import Link from 'next/link';
import { clsx } from 'clsx';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
}

export const SidebarLink = ({ href, icon, children, active }: SidebarLinkProps) => {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center p-2 rounded-md text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <div className="mr-3">{icon}</div>
      {children}
    </Link>
  );
};