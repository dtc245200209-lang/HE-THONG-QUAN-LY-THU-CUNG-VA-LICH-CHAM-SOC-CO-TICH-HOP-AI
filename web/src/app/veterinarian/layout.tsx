import StaffLayout from '@/components/layout/StaffLayout';

export default function VeterinarianLayout({ children }: { children: React.ReactNode }) {
  return <StaffLayout role="VETERINARIAN">{children}</StaffLayout>;
}
