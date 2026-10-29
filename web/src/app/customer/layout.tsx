'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CustomerSidebar from '@/components/layout/CustomerSidebar';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !user) return;
    const roleNames = (user.roles || []).map((r: any) => r.name);
    // Allow ADMIN to view any page, and allow any staff to view /customer/orders to inspect customer experience
    if (roleNames.includes('ADMIN') || pathname.startsWith('/customer/orders')) {
      return;
    }
    // If user is a staff member and not a customer, redirect to their staff portal
    if (!roleNames.includes('CUSTOMER')) {
      if (roleNames.includes('CAREGIVER')) {
        router.replace('/caregiver');
      } else if (roleNames.includes('VETERINARIAN')) {
        router.replace('/veterinarian');
      } else if (roleNames.includes('RECEPTIONIST')) {
        router.replace('/receptionist');
      }
    }
  }, [user, loading, router, pathname]);


  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <CustomerSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
