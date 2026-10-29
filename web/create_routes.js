const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app');

const routes = [
  // CUSTOMER
  'customer/pets',
  'customer/pets/[id]',
  'customer/pets/[id]/timeline',
  'customer/pets/[id]/documents',
  'customer/pets/[id]/emergency',
  'customer/appointments',
  'customer/ai',
  'customer/notifications',
  'customer/profile',

  // RECEPTIONIST
  'receptionist/appointments',
  'receptionist/customers',
  'receptionist/pets',
  'receptionist/veterinarians',
  'receptionist/caregivers',
  'receptionist/services',
  'receptionist/payments',
  'receptionist/notifications',

  // VETERINARIAN
  'veterinarian/patients',
  'veterinarian/patients/[id]',
  'veterinarian/schedule',
  'veterinarian/medical-records',
  'veterinarian/prescriptions',
  'veterinarian/vaccinations',
  'veterinarian/documents',
  'veterinarian/notifications',

  // CAREGIVER
  'caregiver/schedule',
  'caregiver/pets',
  'caregiver/sessions',
  'caregiver/sessions/[id]',
  'caregiver/reports',
  'caregiver/notifications',

  // ADMIN
  'admin/users',
  'admin/staff',
  'admin/pets',
  'admin/appointments',
  'admin/services',
  'admin/payments',
  'admin/reports',
  'admin/analytics',
  'admin/ai',
  'admin/audit',
  'admin/settings'
];

routes.forEach(route => {
  const dirPath = path.join(appDir, ...route.split('/'));
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    const pageName = route.split('/').pop().replace(/\[|\]/g, '') + 'Page';
    const content = `'use client';

export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">${route}</h1>
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <p className="text-gray-500">Nội dung trang đang được xây dựng (đã sửa lỗi 404).</p>
      </div>
    </div>
  );
}
`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created: ${route}/page.tsx`);
  }
});
