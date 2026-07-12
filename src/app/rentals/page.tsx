"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Rental, Unit, Tenant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type StatusFilter = "semua" | "berlangsung" | "selesai";

export default function RentalsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [rentalsData, unitsData, tenantsData] = await Promise.all([
        supabase.from('rentals').select('*').order('created_at', { ascending: false }),
        supabase.from('units').select('*'),
        supabase.from('tenants').select('*'),
      ]);

      if (rentalsData.error) throw rentalsData.error;
      if (unitsData.error) throw unitsData.error;
      if (tenantsData.error) throw tenantsData.error;

      setRentals(rentalsData.data || []);
      setUnits(unitsData.data || []);
      setTenants(tenantsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Join rentals with unit and tenant data
  const rentalsWithDetails = rentals.map((rental) => {
    const unit = units.find((u) => u.id === rental.unit_id);
    const tenant = tenants.find((t) => t.id === rental.tenant_id);

    // Calculate total price based on rental duration
    const startDate = new Date(rental.tanggal_mulai);
    const endDate = new Date(rental.tanggal_selesai);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = unit ? unit.harga_sewa_per_hari * days : 0;

    return {
      ...rental,
      unit,
      tenant,
      totalPrice,
    };
  });

  // Filter by status
  const filteredRentals = rentalsWithDetails.filter((rental) => {
    if (statusFilter === "semua") return true;
    return rental.status === statusFilter;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (index: number) => {
    const colors = ["bg-primary/10 text-primary", "bg-tertiary/10 text-tertiary"];
    return colors[index % colors.length];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "selesai") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  return (
    <SidebarLayout
      title="Penyewaan"
      description="Kelola semua transaksi penyewaan kendaraan Anda."
      action={
        <Link href="/rentals/new">
          <Button className="whitespace-nowrap">
            + Buat Penyewaan Baru
          </Button>
        </Link>
      }
    >

      {/* Status Filters */}
      <div className="border-b border-border pb-4 mb-6">
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="semua">Semua</TabsTrigger>
            <TabsTrigger value="berlangsung">Berlangsung</TabsTrigger>
            <TabsTrigger value="selesai">Selesai</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Data Table / Cards */}
      {filteredRentals.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {statusFilter === "semua" ? "Belum ada transaksi penyewaan" : `Tidak ada transaksi ${statusFilter}`}
          </h3>
          <p className="text-muted-foreground mb-6">
            {statusFilter === "semua"
              ? "Mulai dengan membuat transaksi penyewaan pertama Anda."
              : `Coba filter lain untuk melihat transaksi.`}
          </p>
        </div>
      ) : (
        <div className="bg-card border rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nama Penyewa
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Unit Kendaraan
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tanggal Mulai
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tanggal Selesai
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Harga
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRentals.map((rental, index) => (
                  <tr key={rental.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-sm font-medium`}>
                          {rental.tenant ? getInitials(rental.tenant.nama) : "--"}
                        </div>
                        <span className="font-medium text-foreground">
                          {rental.tenant?.nama || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-foreground">{rental.unit?.nama || "Unknown"}</td>
                    <td className="py-4 px-4 text-muted-foreground">{formatDate(rental.tanggal_mulai)}</td>
                    <td className="py-4 px-4 text-muted-foreground">{formatDate(rental.tanggal_selesai)}</td>
                    <td className="py-4 px-4 font-mono text-sm text-foreground">
                      Rp {rental.totalPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(rental.status)}`}>
                        {rental.status === "selesai" ? "Selesai" : "Berlangsung"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/rentals/${rental.id}`}>
                        <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                          Detail
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden flex flex-col divide-y">
            {filteredRentals.map((rental, index) => (
              <div key={rental.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-sm font-medium`}>
                      {rental.tenant ? getInitials(rental.tenant.nama) : "--"}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {rental.tenant?.nama || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rental.unit?.nama || "Unknown"}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(rental.status)}`}>
                    {rental.status === "selesai" ? "Selesai" : "Berlangsung"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 bg-muted p-3 rounded-lg border border-border/50">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Mulai</div>
                    <div className="text-sm text-foreground">{formatDate(rental.tanggal_mulai)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Selesai</div>
                    <div className="text-sm text-foreground">{formatDate(rental.tanggal_selesai)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-mono text-sm text-foreground font-medium">
                    Rp {rental.totalPrice.toLocaleString("id-ID")}
                  </div>
                  <Link href={`/rentals/${rental.id}`}>
                    <button className="px-3 py-2 border border-border rounded-lg text-muted-foreground text-sm hover:bg-muted transition-colors">
                      Detail
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t bg-muted flex justify-between items-center mt-auto">
            <span className="text-sm text-muted-foreground">
              Menampilkan {filteredRentals.length} dari {rentalsWithDetails.length} transaksi
            </span>
            <div className="flex gap-2">
              <button className="p-2 rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-50" disabled>
                ←
              </button>
              <button className="p-2 rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-50" disabled>
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
