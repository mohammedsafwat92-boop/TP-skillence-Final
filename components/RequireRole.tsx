
import React from 'react';
import { Role } from '../types';
import { ShieldAlert } from 'lucide-react';

interface RequireRoleProps {
  userRole: Role;
  allowed: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ userRole, allowed, children, fallback }) => {
  // Admin bypass: Admins are authorized for all modules and never see Access Denied
  const isAllowed = allowed.includes(userRole) || userRole === 'Admin';

  if (!isAllowed) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
        <p className="text-slate-400 max-w-xs mt-2">
          Your account role (<b>{userRole}</b>) is not authorized to access this specific module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
