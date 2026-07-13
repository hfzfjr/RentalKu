"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Unit, Tenant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewRentalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    unit_id: "",
    tenant_id: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    catatan: "",
  });
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [unitsData, tenantsData] = await Promise.all([
        supabase.from('units').select('*'),
        supabase.from('tenants').select('*'),
      ]);

      if (unitsData.error) throw unitsData.error;
      if (tenantsData.error) throw tenantsData.error;

      setUnits(unitsData.data || []);
      setTenants(tenantsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter only available units
  const availableUnits = units.filter((unit) => unit.status === "tersedia");

  // Calculate total price
  const selectedUnit = units.find((u) => u.id === formData.unit_id);
  const totalPrice = selectedUnit && formData.tanggal_mulai && formData.tanggal_selesai
    ? (() => {
      const startDate = new Date(formData.tanggal_mulai);
      const endDate = new Date(formData.tanggal_selesai);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, days) * selectedUnit.harga_sewa_per_hari;
    })()
    : 0;

  const duration = formData.tanggal_mulai && formData.tanggal_selesai
    ? (() => {
      const startDate = new Date(formData.tanggal_mulai);
      const endDate = new Date(formData.tanggal_selesai);
      return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    })()
    : 0;

  const isFormValid = formData.unit_id && formData.tenant_id && formData.tanggal_mulai && formData.tanggal_selesai;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      alert("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      // Create new rental record
      const { error: rentalError } = await supabase
        .from('rentals')
        .insert({
          unit_id: formData.unit_id,
          tenant_id: formData.tenant_id,
          tanggal_mulai: formData.tanggal_mulai,
          tanggal_selesai: formData.tanggal_selesai,
          status: 'berlangsung',
          catatan: formData.catatan || null,
        });

      if (rentalError) throw rentalError;

      // Update unit status to "disewa"
      const { error: unitError } = await supabase
        .from('units')
        .update({ status: 'disewa' })
        .eq('id', formData.unit_id);

      if (unitError) throw unitError;

      // Redirect to /rentals
      router.push("/rentals");
    } catch (error) {
      console.error('Error creating rental:', error);
      alert("Gagal membuat penyewaan. Silakan coba lagi.");
    }
  };

  if (loading) {
    return (
      <SidebarLayout
        title="Buat Penyewaan Baru"
        description="Loading..."
        action={
          <Button
            variant="outline"
            onClick={() => router.push("/rentals")}
          >
            Kembali
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-card border rounded-lg p-6 shadow-sm space-y-6">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="lg:col-span-4 bg-card border rounded-lg p-6 shadow-sm">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      title="Buat Penyewaan Baru"
      description="Lengkapi form di bawah ini untuk mencatat transaksi penyewaan baru."
      action={
        <Button
          variant="outline"
          onClick={() => router.push("/rentals")}
        >
          Kembali
        </Button>
      }
    >

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Main Form Area */}
        <div className="lg:col-span-8 bg-card border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Vehicle & Tenant Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Detail Kendaraan & Penyewa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unit Selection */}
                <div>
                  <label htmlFor="unitId" className="block text-sm font-medium text-muted-foreground mb-2">
                    Pilih Unit Kendaraan <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Icons.Car className="w-4 h-4" />
                    </span>
                    <select
                      id="unit_id"
                      name="unit_id"
                      value={formData.unit_id}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-background border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                    >
                      <option disabled value="">Pilih kendaraan...</option>
                      {availableUnits.length === 0 ? (
                        <option disabled>Tidak ada unit tersedia</option>
                      ) : (
                        availableUnits.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.nama} ({unit.plat_nomor}) - Rp {unit.harga_sewa_per_hari.toLocaleString("id-ID")}/hari
                          </option>
                        ))
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <span>▼</span>
                    </div>
                  </div>
                </div>

                {/* Tenant Selection */}
                <div>
                  <label htmlFor="tenant_id" className="block text-sm font-medium text-muted-foreground mb-2">
                    Pilih Penyewa <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      👤
                    </span>
                    <select
                      id="tenant_id"
                      name="tenant_id"
                      value={formData.tenant_id}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-background border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                    >
                      <option disabled value="">Cari nama penyewa...</option>
                      {tenants.length === 0 ? (
                        <option disabled>Tidak ada penyewa tersedia</option>
                      ) : (
                        tenants.map((tenant) => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.nama} ({tenant.no_hp})
                          </option>
                        ))
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <span>▼</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Rental Period */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 mt-6">
                Periode Sewa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label htmlFor="tanggal_mulai" className="block text-sm font-medium text-muted-foreground mb-2">
                    Tanggal Mulai <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      📅
                    </span>
                    <input
                      id="tanggal_mulai"
                      name="tanggal_mulai"
                      type="date"
                      value={formData.tanggal_mulai}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-background border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="tanggal_selesai" className="block text-sm font-medium text-muted-foreground mb-2">
                    Tanggal Selesai <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      📅
                    </span>
                    <input
                      id="tanggal_selesai"
                      name="tanggal_selesai"
                      type="date"
                      value={formData.tanggal_selesai}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-background border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Additional Notes */}
            <div className="space-y-4">
              <label htmlFor="catatan" className="block text-sm font-medium text-muted-foreground mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                id="catatan"
                name="catatan"
                value={formData.catatan}
                onChange={handleInputChange}
                placeholder="Tambahkan catatan khusus terkait penyewaan ini..."
                rows={3}
                className="w-full px-4 py-2 bg-background border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
              />
            </div>
          </form>
        </div>

        {/* Right Column: Summary Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-card border rounded-lg p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">
              Ringkasan Penyewaan
            </h3>
            <div className="grow space-y-4">
              {/* Unit Details */}
              <div className="bg-muted p-4 rounded-md flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-primary">
                  <Icons.Car className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Unit Terpilih</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedUnit ? selectedUnit.nama : "Belum dipilih"}
                  </p>
                </div>
              </div>

              {/* Calculation Details */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Harga Sewa/Hari</span>
                  <span className="text-sm font-mono text-foreground">
                    Rp {selectedUnit ? selectedUnit.harga_sewa_per_hari.toLocaleString("id-ID") : "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Durasi (Hari)</span>
                  <span className="text-sm font-mono text-foreground">{duration}</span>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-end mb-4">
                <span className="text-lg font-semibold text-foreground">Total Pembayaran</span>
                <span className="text-2xl font-bold text-primary">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || availableUnits.length === 0}
                className="w-full"
              >
                <span className="mr-2">✓</span>
                Buat Penyewaan
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {availableUnits.length === 0
                  ? "Tidak ada unit tersedia untuk disewa"
                  : "Lengkapi form untuk melanjutkan"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
