import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from './UserProfile';
import { ChevronRight } from 'lucide-react';
import type { User } from '../../types';

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  currentUser: User;
  onLogoutClick: () => void;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  breadcrumbs, 
  currentUser, 
  onLogoutClick,
  children 
}: PageHeaderProps) {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center ">
          <h1 className="text-2xl font-bold text-gray-900 mr-4">{title}</h1>
          {breadcrumbs && breadcrumbs.length > 1 && (
            <div className="flex items-center space-x-2 mt-1">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  {breadcrumb.href ? (
                    <Link 
                      to={breadcrumb.href}
                      className="text-sm text-gray-500 hover:text-primary-600"
                    >
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {breadcrumb.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <UserProfile 
          user={currentUser} 
          onLogoutClick={onLogoutClick} 
        />
      </div>

      {/* Additional content (like filters, buttons, etc.) */}
      {children}
    </div>
  );
}