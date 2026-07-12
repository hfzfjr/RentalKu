"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Unit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

export default function UnitDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    jenis: "motor" as "motor" | "mobil",
    plat_nomor: "",
    harga_sewa_per_hari: 0,
    status: "tersedia" as "tersedia" | "disewa",
    image_url: "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUnit();
  }, [params.id]);

  async function fetchUnit() {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      if (data) {
        setUnit(data);
        setFormData({
          nama: data.nama,
          jenis: data.jenis,
          plat_nomor: data.plat_nomor,
          harga_sewa_per_hari: data.harga_sewa_per_hari,
          status: data.status,
          image_url: data.image_url || "",
        });
      }
    } catch (error) {
      console.error('Error fetching unit:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "harga_sewa_per_hari" ? Number(value) : value,
    }));
  };

  const handleStatusChange = (status: "tersedia" | "disewa") => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('units')
        .update({
          nama: formData.nama,
          jenis: formData.jenis,
          plat_nomor: formData.plat_nomor,
          harga_sewa_per_hari: formData.harga_sewa_per_hari,
          status: formData.status,
          image_url: formData.image_url || null,
        })
        .eq('id', params.id);

      if (error) throw error;
      router.push("/units");
    } catch (error) {
      console.error('Error updating unit:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
      setShowDeleteDialog(false);
      router.push("/units");
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Unit tidak ditemukan</h1>
        <Button onClick={() => router.push("/units")}>Kembali</Button>
      </div>
    );
  }

  const isAvailable = formData.status === "tersedia";

  return (
    <SidebarLayout
      title="Detail Unit Kendaraan"
      description="Edit detail unit kendaraan."
      action={
        <Button
          variant="outline"
          onClick={() => router.push("/units")}
        >
          Kembali
        </Button>
      }
    >
      {/* Form Area */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Photo */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted group">
              {unit.image_url ? (
                <img
                  alt="Vehicle Photo"
                  className="w-full h-full object-cover"
                  src={unit.image_url}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-6xl text-muted-foreground">🚗</span>
                </div>
              )}
              {/* Overlay for edit */}
              <div className="absolute inset-0 bg-foreground/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button className="bg-background text-primary px-4 py-2 rounded-lg shadow-sm hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium">
                  <span>📷</span>
                  Ganti Foto
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Format yang didukung: JPG, PNG. Maksimal 5MB.
            </p>
          </div>

          {/* Right Column: Form */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Kendaraan */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="nama" className="text-sm font-medium text-muted-foreground">
                  Nama Kendaraan
                </label>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full bg-background border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Jenis */}
              <div className="flex flex-col gap-2">
                <label htmlFor="jenis" className="text-sm font-medium text-muted-foreground">
                  Jenis Kendaraan
                </label>
                <div className="relative">
                  <select
                    id="jenis"
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleInputChange}
                    className="w-full appearance-none bg-background border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="motor">Motor</option>
                    <option value="mobil">Mobil</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                    <span>▼</span>
                  </div>
                </div>
              </div>

              {/* Plat Nomor */}
              <div className="flex flex-col gap-2">
                <label htmlFor="plat_nomor" className="text-sm font-medium text-muted-foreground">
                  Plat Nomor
                </label>
                <input
                  id="plat_nomor"
                  name="plat_nomor"
                  type="text"
                  value={formData.plat_nomor}
                  onChange={handleInputChange}
                  className="w-full bg-background border rounded-lg px-4 py-2 text-foreground uppercase focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Harga Sewa */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="harga_sewa_per_hari" className="text-sm font-medium text-muted-foreground">
                  Harga Sewa per Hari
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-muted-foreground">Rp</span>
                  <input
                    id="harga_sewa_per_hari"
                    name="harga_sewa_per_hari"
                    type="number"
                    value={formData.harga_sewa_per_hari}
                    onChange={handleInputChange}
                    className="w-full bg-background border rounded-lg pl-12 pr-4 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-2">
                  Status Ketersediaan
                </label>
                <div className="flex p-1 bg-muted rounded-lg border w-fit">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("tersedia")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${isAvailable
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Tersedia
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("disewa")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${!isAvailable
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Disewa
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-border my-4 md:my-6" />

            {/* Footer Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <span className="mr-2">🗑️</span>
                Hapus Unit
              </Button>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => router.push("/units")}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  className="w-full sm:w-auto"
                >
                  <span className="mr-2">💾</span>
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Hapus Unit Kendaraan
            </h3>
            <p className="text-muted-foreground mb-6">
              Apakah Anda yakin ingin menghapus unit "{unit.nama}"? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
