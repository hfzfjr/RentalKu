"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Unit, Tenant, Rental } from "@/lib/types";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [unitsData, tenantsData, rentalsData] = await Promise.all([
        supabase.from('units').select('*').eq('is_deleted', false),
        supabase.from('tenants').select('*').eq('is_deleted', false),
        supabase.from('rentals').select('*').eq('is_deleted', false).order('created_at', { ascending: false }).limit(5),
      ]);

      if (unitsData.error) throw unitsData.error;
      if (tenantsData.error) throw tenantsData.error;
      if (rentalsData.error) throw rentalsData.error;

      setUnits(unitsData.data || []);
      setTenants(tenantsData.data || []);
      setRentals(rentalsData.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate stats from data
  const totalUnits = units.length;
  const availableUnits = units.filter((u) => u.status === "tersedia").length;
  const rentedUnits = units.filter((u) => u.status === "disewa").length;
  const totalTenants = tenants.length;

  return (
    <SidebarLayout
      title="Dashboard"
      description="Ringkasan aktivitas rental kendaraan Anda"
    >
      {loading ? (
        <>
          {/* Stat Cards Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border rounded-lg p-6 shadow-sm">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </section>
          {/* Recent Rentals */}
          <section className="bg-card border rounded-lg p-6 shadow-sm">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Unit"
              value={totalUnits}
              icon={<Icons.Car className="text-2xl" />}
            />
            <StatCard
              title="Unit Tersedia"
              value={availableUnits}
              icon={<Icons.CheckSquare className="text-2xl" />}
            />
            <StatCard
              title="Unit Disewa"
              value={rentedUnits}
              icon={<Icons.ShoppingCart className="text-2xl" />}
            />
            <StatCard
              title="Total Penyewa"
              value={totalTenants}
              icon={<Icons.People className="text-2xl" />}
            />
          </section>

          {/* Recent Rentals Table */}
          <section className="bg-card border rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Penyewaan Terbaru</h3>
              <Link href="/rentals" className="text-primary text-sm hover:underline flex items-center gap-1 cursor-pointer">
                Lihat Semua <Icons.RightArrow className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-6">
              {rentals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4 text-primary">
                    <Icons.ClipboardDocumentList className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Belum ada transaksi penyewaan</h3>
                  <p className="text-muted-foreground">Data penyewaan akan muncul di sini setelah Anda membuat transaksi penyewaan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rentals.map((rental) => {
                    const unit = units.find((u) => u.id === rental.unit_id);
                    const tenant = tenants.find((t) => t.id === rental.tenant_id);
                    return (
                      <div key={rental.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <Icons.Car className="text-lg" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{unit?.nama || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{tenant?.nama || "Unknown"}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rental.status === "selesai"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                          }`}>
                          {rental.status === "selesai" ? "Selesai" : "Berlangsung"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </SidebarLayout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
