"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlert, AlertContainer } from "@/components/ui/alert";

export default function RentalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { alerts, success, error } = useAlert();
  const [rentalData, setRentalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  useEffect(() => {
    fetchRentalData();
  }, [params.id]);

  async function fetchRentalData() {
    try {
      const { data, error: fetchError } = await supabase
        .from('rentals')
        .select(`
          *,
          units (
            id,
            nama,
            plat_nomor,
            jenis,
            harga_sewa_per_hari,
            status,
            image_url,
            tahun_produksi
          ),
          tenants (
            id,
            nama,
            no_hp,
            no_ktp,
            alamat
          )
        `)
        .eq('id', params.id)
        .eq('is_deleted', false)
        .single();

      if (fetchError) throw fetchError;
      setRentalData(data);
    } catch (fetchError) {
      console.error('Error fetching rental data:', fetchError);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCompleteRental = async () => {
    if (!rentalData) return;

    try {
      // Update rental status to 'selesai'
      const { error: rentalError } = await supabase
        .from('rentals')
        .update({ status: 'selesai' })
        .eq('id', rentalData.id);

      if (rentalError) throw rentalError;

      // Update unit status back to 'tersedia'
      const { error: unitError } = await supabase
        .from('units')
        .update({ status: 'tersedia' })
        .eq('id', rentalData.unit_id);

      if (unitError) throw unitError;

      success("Penyewaan berhasil diselesaikan");
      await fetchRentalData();
      setShowCompleteDialog(false);
    } catch (completeError) {
      console.error('Error completing rental:', completeError);
      error("Gagal menyelesaikan penyewaan. Silakan coba lagi.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  };

  const calculateDuration = () => {
    if (!rentalData) return 0;
    const startDate = new Date(rentalData.tanggal_mulai);
    const endDate = new Date(rentalData.tanggal_selesai);
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const calculateTotalPrice = () => {
    if (!rentalData?.units) return 0;
    const days = calculateDuration();
    return days * rentalData.units.harga_sewa_per_hari;
  };

  const isCompleted = rentalData?.status === "selesai";
  const isOngoing = rentalData?.status === "berlangsung";

  if (isLoading) {
    return (
      <SidebarLayout
        title="Detail Penyewaan"
        description="Loading..."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!rentalData) {
    return (
      <SidebarLayout
        title="Detail Penyewaan"
        description="Transaksi tidak ditemukan"
        action={
          <Button
            variant="outline"
            onClick={() => router.push("/rentals")}
          >
            Kembali
          </Button>
        }
      >
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
          <p className="text-muted-foreground">Transaksi tidak ditemukan.</p>
        </div>
      </SidebarLayout>
    );
  }

  const unit = rentalData.units;
  const tenant = rentalData.tenants;

  return (
    <>
      <AlertContainer alerts={alerts} />
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
                  <Icons.Car className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nama Kendaraan</p>
                  <p className="font-semibold text-foreground">{unit.nama}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plat Nomor</p>
                  <p className="font-medium text-foreground uppercase">{unit.plat_nomor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jenis</p>
                  <p className="font-medium text-foreground capitalize">{unit.jenis}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tahun Produksi</p>
                  <p className="font-medium text-foreground">{unit.tahun_produksi}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Harga Sewa/Hari</p>
                  <p className="font-medium text-foreground">Rp {unit.harga_sewa_per_hari.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Details */}
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">Detail Penyewa</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xl font-bold">
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
                  <p className="font-medium text-foreground">{formatDate(rentalData.tanggal_mulai)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                  <p className="font-medium text-foreground">{formatDate(rentalData.tanggal_selesai)}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Durasi</p>
                <p className="font-semibold text-foreground">{calculateDuration()} hari</p>
              </div>
              {rentalData.catatan && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Catatan</p>
                  <p className="font-medium text-foreground">{rentalData.catatan}</p>
                </div>
              )}
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
        <div className="mt-8 flex justify-end gap-4">
          {isOngoing && (
            <Button
              onClick={() => setShowCompleteDialog(true)}
              className="w-full sm:w-auto"
            >
              Selesaikan Sewa
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
    </>
  );
}
