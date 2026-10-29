import StaffLayout from '@/components/layout/StaffLayout';

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  return <StaffLayout role="RECEPTIONIST">{children}</StaffLayout>;
}
