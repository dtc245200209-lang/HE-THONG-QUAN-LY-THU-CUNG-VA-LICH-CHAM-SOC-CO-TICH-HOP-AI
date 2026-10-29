'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PetRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params?.id) {
      router.replace(`/customer/pets/${params.id}/passport`);
    }
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
