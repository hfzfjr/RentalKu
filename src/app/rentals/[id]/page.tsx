"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockPenyewaan, mockUnits, mockPenyewa, Penyewaan, Unit, Penyewa } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { SidebarLayout } from "@/components/SidebarLayout";

export default function RentalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rental, setRental] = useState<Penyewaan | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [tenant, setTenant] = useState<Penyewa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [penyewaan, setPenyewaan] = useState<Penyewaan[]>([]);

  useEffect(() => {
    // Load data from localStorage or mock data
    const storedUnits = localStorage.getItem("mockUnits");
    const storedTenants = localStorage.getItem("mockTenants");
    const storedPenyewaan = localStorage.getItem("mockPenyewaan");

    const unitsData = storedUnits ? JSON.parse(storedUnits) : mockUnits;
    const tenantsData = storedTenants ? JSON.parse(storedTenants) : mockPenyewa;
    const penyewaanData = storedPenyewaan ? JSON.parse(storedPenyewaan) : mockPenyewaan;

    setUnits(unitsData);
    setPenyewaan(penyewaanData);

    // Find rental by ID
    const foundRental = penyewaanData.find((r: Penyewaan) => r.id === params.id);
    if (foundRental) {
      setRental(foundRental);
      const foundUnit = unitsData.find((u: Unit) => u.id === foundRental.unitId);
      const foundTenant = tenantsData.find((t: Penyewa) => t.id === foundRental.penyewaId);
      setUnit(foundUnit || null);
      setTenant(foundTenant || null);
    }
    setIsLoading(false);
  }, [params.id]);

  const handleCompleteRental = () => {
    if (!rental || !unit) return;

    // Update rental status to "selesai"
    const updatedPenyewaan = penyewaan.map((r: Penyewaan) =>
      r.id === rental.id ? { ...r, status: "selesai" as const } : r
    );
    localStorage.setItem("mockPenyewaan", JSON.stringify(updatedPenyewaan));

    // Update unit status back to "tersedia"
    const updatedUnits = units.map((u: Unit) =>
      u.id === unit.id ? { ...u, status: "tersedia" as const } : u
    );
    localStorage.setItem("mockUnits", JSON.stringify(updatedUnits));

    setShowCompleteDialog(false);
    router.push("/rentals");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  };

  const calculateDuration = () => {
    if (!rental) return 0;
    const startDate = new Date(rental.tanggalMulai);
    const endDate = new Date(rental.tanggalSelesai);
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const calculateTotalPrice = () => {
    if (!unit || !rental) return 0;
    const days = calculateDuration();
    return days * unit.hargaSewaPerHari;
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
                <p className="font-medium text-foreground">{unit.platNomor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jenis</p>
                <p className="font-medium text-foreground capitalize">{unit.jenis}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Harga Sewa/Hari</p>
                <p className="font-medium text-foreground">Rp {unit.hargaSewaPerHari.toLocaleString("id-ID")}</p>
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
                <p className="font-medium text-foreground">{tenant.noHp}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No. KTP</p>
                <p className="font-mono text-sm text-foreground">{tenant.noKtp}</p>
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
                <p className="font-medium text-foreground">{formatDate(rental.tanggalMulai)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                <p className="font-medium text-foreground">{formatDate(rental.tanggalSelesai)}</p>
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
              <span className="font-mono text-foreground">Rp {unit.hargaSewaPerHari.toLocaleString("id-ID")}</span>
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
