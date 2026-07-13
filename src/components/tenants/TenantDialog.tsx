"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tenant } from "@/lib/types";

interface TenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Omit<Tenant, "id" | "created_at" | "updated_at">) => void;
  tenant?: Tenant; // If provided, it's edit mode
}

export function TenantDialog({ isOpen, onClose, onSave, tenant }: TenantDialogProps) {
  const [formData, setFormData] = useState({
    nama: "",
    no_hp: "",
    alamat: "",
    no_ktp: "",
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        nama: tenant.nama,
        no_hp: tenant.no_hp,
        alamat: tenant.alamat,
        no_ktp: tenant.no_ktp,
      });
    } else {
      setFormData({
        nama: "",
        no_hp: "",
        alamat: "",
        no_ktp: "",
      });
    }
  }, [tenant, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.nama || !formData.no_ktp || !formData.no_hp || !formData.alamat) {
      alert("Mohon lengkapi semua data");
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = !!tenant;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Modal Container */}
      <div className="relative bg-card rounded-lg shadow-xl border w-full max-w-lg flex flex-col max-h-[90vh] transform transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted rounded-t-lg">
          <h3 className="text-lg font-semibold text-foreground">
            {isEditMode ? "Edit Penyewa" : "Tambah Penyewa"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted cursor-pointer"
            aria-label="Close modal"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Modal Body (Form) */}
        <div className="p-6 overflow-y-auto flex-1 bg-background">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input: Nama Lengkap */}
            <div className="flex flex-col gap-2">
              <label htmlFor="nama" className="text-sm font-medium text-muted-foreground">
                Nama Lengkap
              </label>
              <input
                id="nama"
                name="nama"
                type="text"
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap sesuai KTP"
                required
                className="w-full bg-background border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              />
            </div>

            {/* Input: No. KTP */}
            <div className="flex flex-col gap-2">
              <label htmlFor="no_ktp" className="text-sm font-medium text-muted-foreground">
                Nomor KTP (NIK)
              </label>
              <input
                id="no_ktp"
                name="no_ktp"
                type="text"
                value={formData.no_ktp}
                onChange={handleInputChange}
                placeholder="16 digit angka"
                required
                pattern="[0-9]{16}"
                className="w-full bg-background border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground font-mono"
              />
            </div>

            {/* Input: No. HP */}
            <div className="flex flex-col gap-2">
              <label htmlFor="no_hp" className="text-sm font-medium text-muted-foreground">
                Nomor HP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground text-sm">+62</span>
                </div>
                <input
                  id="no_hp"
                  name="no_hp"
                  type="tel"
                  value={formData.no_hp}
                  onChange={handleInputChange}
                  placeholder="8123456789"
                  required
                  className="w-full bg-background border rounded-lg px-3 py-2 pl-11 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Input: Alamat */}
            <div className="flex flex-col gap-2">
              <label htmlFor="alamat" className="text-sm font-medium text-muted-foreground">
                Alamat Lengkap
              </label>
              <textarea
                id="alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                placeholder="Alamat domisili saat ini"
                required
                rows={3}
                className="w-full bg-background border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-primary hover:bg-primary/10"
              >
                Batal
              </Button>
              <Button type="submit">
                Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
