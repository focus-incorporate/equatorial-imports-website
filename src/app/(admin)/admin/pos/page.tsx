'use client';

import AdminLayout from '@/components/admin/layout/AdminLayout';
import POSInterface from '@/components/admin/pos/POSInterface';

export default function POSPage() {
  return (
    <AdminLayout title="Point of Sale">
      <div className="h-full -m-6">
        <POSInterface />
      </div>
    </AdminLayout>
  );
}