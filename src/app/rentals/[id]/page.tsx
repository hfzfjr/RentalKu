"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Rental, Unit, Tenant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

export default function RentalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rental, setRental] = useState<Rental | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  useEffect(() => {
    fetchRentalData();
  }, [params.id]);

  async function fetchRentalData() {
    try {
      const [rentalData, unitsData, tenantsData] = await Promise.all([
        supabase.from('rentals').select('*').eq('id', params.id).single(),
        supabase.from('units').select('*'),
        supabase.from('tenants').select('*'),
      ]);

      if (rentalData.error) throw rentalData.error;
      if (unitsData.error) throw unitsData.error;
      if (tenantsData.error) throw tenantsData.error;

      if (rentalData.data) {
        setRental(rentalData.data);
        const foundUnit = unitsData.data?.find((u: Unit) => u.id === rentalData.data.unit_id);
        const foundTenant = tenantsData.data?.find((t: Tenant) => t.id === rentalData.data.tenant_id);
        setUnit(foundUnit || null);
        setTenant(foundTenant || null);
      }
    } catch (error) {
      console.error('Error fetching rental data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCompleteRental = async () => {
    if (!rental || !unit) return;

    try {
      const { error } = await supabase
        .from('rentals')
        .update({ status: 'selesai' })
        .eq('id', rental.id);

      if (error) throw error;
      await fetchRentalData();
      setShowCompleteDialog(false);
    } catch (error) {
      console.error('Error completing rental:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  };

  const calculateDuration = () => {
    if (!rental) return 0;
    const startDate = new Date(rental.tanggal_mulai);
    const endDate = new Date(rental.tanggal_selesai);
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const calculateTotalPrice = () => {
    if (!unit || !rental) return 0;
    const days = calculateDuration();
    return days * unit.harga_sewa_per_hari;
  };

  const isCompleted = rental?.status === "selesai";
  const isOngoing = rental?.status === "berlangsung";

  if (isLoading) {
    return (
      <SidebarLayout
        title="Detail Penyewaan"
        description="Loading..."
      >
        <p className="text-muted-foreground">Loading...</p>
      </SidebarLayout>
    );
  }

  if (!rental || !unit || !tenant) {
    return (
      <SidebarLayout
        title="Detail Penyewaan"
        description="Transaksi tidak ditemukan"
      >
        <h1 className="text-3xl font-bold mb-4">Transaksi tidak ditemukan</h1>
        <Button onClick={() => router.push("/rentals")}>Kembali</Button>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      title="Detail Penyewaan"
      description="Lihat detail transaksi penyewaan kendaraan."
      action={
        <Button
          variant="outline"
          onClick={() => router.push("/rentals")}
        >
          Kembali
        </Button>
      }
    >

      {/* Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Details */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">Detail Unit</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-2xl">
                🚗
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nama Kendaraan</p>
                <p className="font-semibold text-foreground">{unit.nama}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plat Nomor</p>
                <p className="font-medium text-foreground">{unit.plat_nomor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jenis</p>
                <p className="font-medium text-foreground capitalize">{unit.jenis}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Harga Sewa/Hari</p>
                <p className="font-medium text-foreground">Rp {unit.harga_sewa_per_hari.toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Unit</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${unit.status === "tersedia"
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
                  }`}>
                  {unit.status === "tersedia" ? "Tersedia" : "Disewa"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Details */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">Detail Penyewa</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-tertiary/10 rounded-full flex items-center justify-center text-tertiary text-xl font-bold">
                {tenant.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nama Penyewa</p>
                <p className="font-semibold text-foreground">{tenant.nama}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">No. HP</p>
                <p className="font-medium text-foreground">{tenant.no_hp}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No. KTP</p>
                <p className="font-mono text-sm text-foreground">{tenant.no_ktp}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alamat</p>
                <p className="font-medium text-foreground">{tenant.alamat}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rental Period */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">Periode Sewa</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                <p className="font-medium text-foreground">{formatDate(rental.tanggal_mulai)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                <p className="font-medium text-foreground">{formatDate(rental.tanggal_selesai)}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Durasi</p>
              <p className="font-semibold text-foreground">{calculateDuration()} hari</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">Ringkasan Pembayaran</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Harga Sewa/Hari</span>
              <span className="font-mono text-foreground">Rp {unit.harga_sewa_per_hari.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Durasi</span>
              <span className="font-mono text-foreground">{calculateDuration()} hari</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-end">
                <span className="font-semibold text-foreground">Total Pembayaran</span>
                <span className="text-2xl font-bold text-primary">Rp {calculateTotalPrice().toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/rentals")}
          className="w-full sm:w-auto"
        >
          Kembali
        </Button>
        {isOngoing && (
          <Button
            onClick={() => setShowCompleteDialog(true)}
            className="w-full sm:w-auto"
          >
            ✓ Selesaikan Sewa
          </Button>
        )}
      </div>

      {/* Complete Confirmation Dialog */}
      {showCompleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setShowCompleteDialog(false)}
          />
          <div className="relative bg-card border rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Selesaikan Penyewaan
            </h3>
            <p className="text-muted-foreground mb-6">
              Apakah Anda yakin ingin menyelesaikan penyewaan ini? Status unit "{unit.nama}" akan kembali menjadi "tersedia".
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleCompleteRental}
              >
                Selesaikan
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
