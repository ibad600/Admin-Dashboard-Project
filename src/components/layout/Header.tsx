'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, PackageCheck, User as UserIcon } from 'lucide-react';
import Image from 'next/image';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight">
              Product Admin
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Catalog & Inventory Control
            </p>
          </div>
        </div>

        {/* User Profile & Logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-3 pr-2 py-1 bg-slate-100/80 rounded-full border border-slate-200/60">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-600">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.username}
                    fill
                    sizes="32px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-slate-500 font-mono leading-tight">
                  @{user.username}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/60 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
