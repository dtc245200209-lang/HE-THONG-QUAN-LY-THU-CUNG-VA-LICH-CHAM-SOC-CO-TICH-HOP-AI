'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VeterinarianRecordsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/veterinarian/medical-records');
  }, [router]);

  return (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
