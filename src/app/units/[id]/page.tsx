"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

interface RentalHistory {
  id: string;
  tenant_name: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: string;
}

export default function UnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [unit, setUnit] = useState<any>(null);
  const [rentalHistory, setRentalHistory] = useState<RentalHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageOverlay, setShowImageOverlay] = useState(false);

  useEffect(() => {
    fetchUnitData();
  }, [params.id]);

  async function fetchUnitData() {
    try {
      // Fetch unit data
      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select('*')
        .eq('id', params.id)
        .eq('is_deleted', false)
        .single();

      if (unitError) throw unitError;
      setUnit(unitData);

      // Fetch rental history
      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select(`
          id,
          tanggal_mulai,
          tanggal_selesai,
          status,
          tenants (
            nama
          )
        `)
        .eq('unit_id', params.id)
        .eq('is_deleted', false)
        .order('tanggal_mulai', { ascending: false });

      if (rentalsError) throw rentalsError;

      const formattedHistory = rentalsData?.map((rental: any) => ({
        id: rental.id,
        tenant_name: rental.tenants?.nama || 'Unknown',
        tanggal_mulai: rental.tanggal_mulai,
        tanggal_selesai: rental.tanggal_selesai,
        status: rental.status,
      })) || [];

      setRentalHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching unit data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <SidebarLayout
        title="Detail Unit Kendaraan"
        description="Memuat data unit..."
      >
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full aspect-square" />
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!unit) {
    return (
      <SidebarLayout
        title="Detail Unit Kendaraan"
        description="Unit tidak ditemukan"
        action={
          <Button
            variant="outline"
            onClick={() => router.push("/units")}
          >
            Kembali
          </Button>
        }
      >
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
          <p className="text-muted-foreground">Unit tidak ditemukan.</p>
        </div>
      </SidebarLayout>
    );
  }

  const vehicleIcon = unit.jenis === "motor" ? "two_wheeler" : "four_wheeler";
  const statusDotClass = unit.status === "tersedia" ? "bg-green-500" : "bg-red-500";
  const statusBadgeClass = unit.status === "tersedia"
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-red-100 text-red-700 border-red-200";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <SidebarLayout
      title="Detail Unit Kendaraan"
      description="Lihat detail informasi unit kendaraan."
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/units/${params.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/units")}
          >
            Kembali
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Unit Information Card */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: Photo */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
              <div
                className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer group"
                onClick={() => unit.image_url && setShowImageOverlay(true)}
              >
                {unit.image_url ? (
                  <img
                    src={unit.image_url}
                    alt={unit.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Icons.Car className="text-6xl text-muted-foreground" />
                  </div>
                )}
                {unit.image_url && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <Icons.ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{unit.nama}</h2>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${statusBadgeClass}`}>
                    <span className={`w-2 h-2 rounded-full ${statusDotClass}`}></span>
                    {unit.status === "tersedia" ? "Tersedia" : "Disewa"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tahun Produksi</p>
                    <p className="font-medium text-foreground">{unit.tahun_produksi}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Plat Nomor</p>
                    <p className="font-medium text-foreground uppercase">{unit.plat_nomor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Jenis Kendaraan</p>
                    <p className="font-medium text-foreground capitalize">{unit.jenis}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Harga Sewa per Hari</p>
                    <p className="font-bold text-primary">
                      Rp {unit.harga_sewa_per_hari.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rental History Section */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Riwayat Penyewaan</h3>

            {rentalHistory.length === 0 ? (
              <div className="text-center py-12">
                <Icons.NoData className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-sm font-medium text-foreground mb-1">Belum Ada Riwayat</h4>
                <p className="text-sm text-muted-foreground">Unit ini belum pernah disewakan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nama Penyewa</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tanggal Mulai</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tanggal Selesai</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentalHistory.map((rental) => (
                      <tr key={rental.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-foreground">{rental.tenant_name}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{formatDate(rental.tanggal_mulai)}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{formatDate(rental.tanggal_selesai)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rental.status === 'selesai'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                            }`}>
                            {rental.status === 'selesai' ? 'Selesai' : 'Berlangsung'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Overlay */}
      {showImageOverlay && unit.image_url && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowImageOverlay(false)}
        >
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center">
            <img
              src={unit.image_url}
              alt={unit.nama}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors cursor-pointer"
              onClick={() => setShowImageOverlay(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}

