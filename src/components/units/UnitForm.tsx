"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAlert } from "@/components/ui/alert";

interface UnitFormData {
  nama: string;
  jenis: "motor" | "mobil";
  plat_nomor: string;
  harga_sewa_per_hari: number;
  status: "tersedia" | "disewa";
  image_url: string;
  tahun_produksi: string;
}

interface UnitFormProps {
  mode: "create" | "edit";
  initialData?: UnitFormData & { id?: string };
  onSubmit: (data: UnitFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

export function UnitForm({ mode, initialData, onSubmit, onDelete, onCancel }: UnitFormProps) {
  const { success, error } = useAlert();
  const [formData, setFormData] = useState<UnitFormData>({
    nama: initialData?.nama || "",
    jenis: initialData?.jenis || "motor",
    plat_nomor: initialData?.plat_nomor || "",
    harga_sewa_per_hari: initialData?.harga_sewa_per_hari || 0,
    status: initialData?.status || "tersedia",
    image_url: initialData?.image_url || "",
    tahun_produksi: initialData?.tahun_produksi || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama,
        jenis: initialData.jenis,
        plat_nomor: initialData.plat_nomor,
        harga_sewa_per_hari: initialData.harga_sewa_per_hari,
        status: initialData.status,
        image_url: initialData.image_url,
        tahun_produksi: initialData.tahun_produksi,
      });
      setImagePreview(initialData.image_url || null);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "harga_sewa_per_hari" || name === "tahun_produksi" ? Number(value) : value,
    }));
    setTouchedFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(name);
      return newSet;
    });
  };

  const handleStatusChange = (status: "tersedia" | "disewa") => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/image\/(jpeg|jpg|png)$/)) {
        error("Format file harus JPG atau PNG");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        error("Ukuran file maksimal 5MB");
        return;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('units image')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('units image')
          .getPublicUrl(filePath);

        setImagePreview(publicUrl);
        setFormData((prev) => ({ ...prev, image_url: publicUrl }));
        setTouchedFields((prev) => {
          const newSet = new Set(prev);
          newSet.delete("image");
          return newSet;
        });
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        error("Gagal mengupload gambar. Silakan coba lagi.");
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const newTouchedFields = new Set<string>();

    if (!formData.nama) newTouchedFields.add("nama");
    if (!formData.plat_nomor) newTouchedFields.add("plat_nomor");
    if (!formData.tahun_produksi) newTouchedFields.add("tahun_produksi");
    if (formData.harga_sewa_per_hari <= 0) newTouchedFields.add("harga_sewa_per_hari");
    if (!formData.image_url) newTouchedFields.add("image");

    setTouchedFields(newTouchedFields);

    if (newTouchedFields.size > 0) {
      error("Mohon lengkapi semua data dengan benar");
      return;
    }

    const tahun = Number(formData.tahun_produksi);
    if (isNaN(tahun) || tahun < 1900 || tahun > 2099) {
      newTouchedFields.add("tahun_produksi");
      setTouchedFields(newTouchedFields);
      error("Tahun produksi tidak valid");
      return;
    }

    try {
      await onSubmit(formData);
      success(mode === "create" ? "Unit berhasil ditambahkan" : "Unit berhasil diperbarui");
    } catch (submitError) {
      console.error('Error submitting form:', submitError);
      error(mode === "create" ? "Gagal menyimpan unit. Silakan coba lagi." : "Gagal memperbarui unit. Silakan coba lagi.");
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete();
    } catch (deleteError) {
      console.error('Error deleting unit:', deleteError);
      error("Gagal menghapus unit. Silakan coba lagi.");
    }
  };

  const isAvailable = formData.status === "tersedia";
  const title = mode === "create" ? "Tambah Unit Kendaraan" : "Edit Unit Kendaraan";
  const description = mode === "create"
    ? "Tambah unit kendaraan baru ke dalam sistem."
    : "Edit data unit kendaraan yang sudah ada.";

  return (
    <>
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80">
          <div className="bg-card border rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Hapus Unit</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Apakah Anda yakin ingin menghapus unit ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete();
                  setShowDeleteDialog(false);
                }}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Photo */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
            <label className="text-sm font-medium text-muted-foreground">
              Foto Kendaraan
              {touchedFields.has("image") && !formData.image_url && (
                <span className="text-destructive ml-1">*</span>
              )}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div
              className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Icons.ImagePlus className="text-6xl text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-foreground/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {imagePreview ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="bg-background text-destructive px-4 py-2 rounded-lg shadow-sm hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                    Hapus Foto
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bg-background text-primary px-4 py-2 rounded-lg shadow-sm hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
                  >
                    <Icons.Plus className="w-4 h-4" />
                    Upload Foto
                  </button>
                )}
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
                  {touchedFields.has("nama") && !formData.nama && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Contoh: Honda Beat"
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
                  {touchedFields.has("plat_nomor") && !formData.plat_nomor && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>
                <input
                  id="plat_nomor"
                  name="plat_nomor"
                  type="text"
                  value={formData.plat_nomor}
                  onChange={handleInputChange}
                  placeholder="Contoh: B 1234 ABC"
                  className="w-full bg-background border rounded-lg px-4 py-2 text-foreground uppercase focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Tahun Produksi */}
              <div className="flex flex-col gap-2">
                <label htmlFor="tahun_produksi" className="text-sm font-medium text-muted-foreground">
                  Tahun Produksi
                  {touchedFields.has("tahun_produksi") && !formData.tahun_produksi && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>
                <input
                  id="tahun_produksi"
                  name="tahun_produksi"
                  type="number"
                  value={formData.tahun_produksi}
                  onChange={handleInputChange}
                  placeholder="Contoh: 2022"
                  min="1900"
                  max="2099"
                  className="w-full bg-background border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Harga Sewa */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="harga_sewa_per_hari" className="text-sm font-medium text-muted-foreground">
                  Harga Sewa per Hari
                  {touchedFields.has("harga_sewa_per_hari") && formData.harga_sewa_per_hari <= 0 && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-muted-foreground">Rp</span>
                  <input
                    id="harga_sewa_per_hari"
                    name="harga_sewa_per_hari"
                    type="number"
                    value={formData.harga_sewa_per_hari || ""}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
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
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer ${isAvailable
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Tersedia
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("disewa")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer ${!isAvailable
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
            <div className="flex justify-end gap-4 flex-wrap">
              {mode === "edit" && onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full sm:w-auto"
                >
                  Hapus Unit
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                className="w-full sm:w-auto"
              >
                {mode === "create" ? "Simpan Unit" : "Perbarui Unit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
