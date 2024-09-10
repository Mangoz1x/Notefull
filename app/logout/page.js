'use client';

import { useEffect } from 'react';
import { logout } from '@/components/server/auth/logout';

export default function LogoutPage() {
  useEffect(() => {
    const performLogout = async () => {
      await logout();
      window.location.href = '/auth';
    };

    performLogout();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl">Logging out...</p>
    </div>
  );
}