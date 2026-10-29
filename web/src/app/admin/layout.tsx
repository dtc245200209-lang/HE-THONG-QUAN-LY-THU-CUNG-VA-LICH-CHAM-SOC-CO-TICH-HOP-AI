import StaffLayout from '@/components/layout/StaffLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <StaffLayout role="ADMIN">{children}</StaffLayout>;
}
