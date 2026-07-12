"use client";

import { mockUnits, mockPenyewa } from "@/lib/mock-data";
import { SidebarLayout } from "@/components/SidebarLayout";

export default function DashboardPage() {
  // Calculate stats from mock data
  const totalUnits = mockUnits.length;
  const availableUnits = mockUnits.filter((u) => u.status === "tersedia").length;
  const rentedUnits = mockUnits.filter((u) => u.status === "disewa").length;
  const totalTenants = mockPenyewa.length;

  return (
    <SidebarLayout
      title="Dashboard"
      description="Ringkasan aktivitas rental kendaraan Anda"
    >

      {/* Stat Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Unit"
          value={totalUnits}
          icon="🚗"
        />
        <StatCard
          title="Unit Tersedia"
          value={availableUnits}
          icon="✅"
        />
        <StatCard
          title="Unit Disewa"
          value={rentedUnits}
          icon="🛒"
        />
        <StatCard
          title="Total Penyewa"
          value={totalTenants}
          icon="👥"
        />
      </section>

      {/* Recent Rentals Table */}
      <section className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">Penyewaan Terbaru</h3>
          <button className="text-primary text-sm hover:underline flex items-center gap-1">
            Lihat Semua →
          </button>
        </div>
        <div className="p-6">
          {/* Empty State - No rental data yet */}
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Belum ada transaksi penyewaan</h3>
            <p className="text-muted-foreground">Data penyewaan akan muncul di sini setelah Anda membuat transaksi penyewaan.</p>
          </div>
        </div>
      </section>
    </SidebarLayout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
