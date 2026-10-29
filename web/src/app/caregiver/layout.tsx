import StaffLayout from '@/components/layout/StaffLayout';

export default function CaregiverLayout({ children }: { children: React.ReactNode }) {
  return <StaffLayout role="CAREGIVER">{children}</StaffLayout>;
}
