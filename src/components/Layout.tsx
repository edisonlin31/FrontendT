import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Ticket, 
  Home,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './ui/Logo';
import type { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  onLogout: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: UserRole[];
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: Home, 
    roles: ['L1', 'L2', 'L3'] 
  },
  { 
    name: 'My Tickets', 
    href: '/tickets', 
    icon: Ticket, 
    roles: ['L1', 'L2', 'L3'] 
  },
];

export function Layout({ children, currentUser }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavigation = navigation.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-[#f8fbff] shadow-lg rounded-xl border border-gray-200 ">
      {/* Logo */}
      <div className="flex h-16 items-center border-gray-200 px-4 justify-between mt-3">
        <Logo height="h-6" />
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-4">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={() => setIsMobileMenuOpen(false)} // Close mobile menu on navigation
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-br from-amber-500 to-red-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-900/5 hover:text-gray-900'
              )
            }
          >
            <item.icon
              className="mr-2 h-4 w-4 flex-shrink-0"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex p-4">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 mr-4">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        "md:hidden fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Mobile Menu Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 bg-white shadow-sm"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="h-full">
          {children}
        </main>
      </div>
    </div>
  );
}