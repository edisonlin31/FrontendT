import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from './UserProfile';
import { LogoutModal } from './LogoutModal';
import { ChevronRight } from 'lucide-react';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import type { User } from '../../types';

interface AutoPageHeaderProps {
  currentUser: User;
  children?: React.ReactNode;
  customTitle?: string; 
  showBreadcrumbs?: boolean;
}

export function AutoPageHeader({ 
  currentUser, 
  children,
  customTitle,
  showBreadcrumbs = true
}: AutoPageHeaderProps) {
  const { breadcrumbs, title } = useBreadcrumbs();
  const displayTitle = customTitle || title;
  const dispatch = useAppDispatch();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    dispatch(logoutUser());
  };

  return (
    <div className="p-6 ">
      <div className="flex items-start justify-between">
          <div className="flex flex-col lg:flex-row lg:items-center">
            <h1 className="text-2xl font-bold text-gray-900 md:mr-4">{displayTitle}</h1>
            {showBreadcrumbs && breadcrumbs.length > 1 && (
              <div className="flex items-center space-x-2 mt-1 md:mt-0">
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
                      <span className="text-sm text-black">
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
          onLogoutClick={() => setShowLogoutConfirm(true)} 
        />
      </div>

      {children}

      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}