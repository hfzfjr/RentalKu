"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockUnits } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export default function UnitDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [unit, setUnit] = useState<typeof mockUnits[0] | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    jenis: "motor" as "motor" | "mobil",
    platNomor: "",
    hargaSewaPerHari: 0,
    status: "tersedia" as "tersedia" | "disewa",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Find unit by ID from mock data
    const foundUnit = mockUnits.find((u) => u.id === params.id);
    if (foundUnit) {
      setUnit(foundUnit);
      setFormData({
        nama: foundUnit.nama,
        jenis: foundUnit.jenis,
        platNomor: foundUnit.platNomor,
        hargaSewaPerHari: foundUnit.hargaSewaPerHari,
        status: foundUnit.status,
      });
    }
    setIsLoading(false);
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hargaSewaPerHari" ? Number(value) : value,
    }));
  };

  const handleStatusChange = (status: "tersedia" | "disewa") => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleSave = () => {
    // In a real app, this would update the data source
    console.log("Saving unit:", formData);
    // Redirect to /units after save
    router.push("/units");
  };

  const handleDelete = () => {
    // In a real app, this would delete from the data source
    console.log("Deleting unit:", params.id);
    setShowDeleteDialog(false);
    // Redirect to /units after delete
    router.push("/units");
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-4 flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/units")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2"
        >
          <span className="text-xl">←</span>
          <span className="text-sm font-medium">Kembali</span>
        </button>
        <div className="h-6 w-px bg-border mx-2"></div>
        <h1 className="text-xl font-bold text-foreground hidden md:block">Detail Unit Kendaraan</h1>
        <h1 className="text-xl font-bold text-foreground md:hidden">Detail Unit</h1>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
              isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-600" : "bg-orange-600"}`}></span>
            {isAvailable ? "Tersedia" : "Disewa"}
          </span>
        </div>
      </header>

      {/* Form Area */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Photo */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted group">
              {unit.imageUrl ? (
                <img
                  alt="Vehicle Photo"
                  className="w-full h-full object-cover"
                  src={unit.imageUrl}
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
                <label htmlFor="platNomor" className="text-sm font-medium text-muted-foreground">
                  Plat Nomor
                </label>
                <input
                  id="platNomor"
                  name="platNomor"
                  type="text"
                  value={formData.platNomor}
                  onChange={handleInputChange}
                  className="w-full bg-background border rounded-lg px-4 py-2 text-foreground uppercase focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Harga Sewa */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="hargaSewaPerHari" className="text-sm font-medium text-muted-foreground">
                  Harga Sewa per Hari
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-muted-foreground">Rp</span>
                  <input
                    id="hargaSewaPerHari"
                    name="hargaSewaPerHari"
                    type="number"
                    value={formData.hargaSewaPerHari}
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
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      isAvailable
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Tersedia
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("disewa")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      !isAvailable
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
    </div>
  );
}
