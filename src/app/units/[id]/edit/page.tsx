"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { UnitForm } from "@/components/units/UnitForm";
import { AlertContainer } from "@/components/ui/alert";
import { useAlert } from "@/components/ui/alert";

export default function EditUnitPage() {
  const router = useRouter();
  const params = useParams();
  const { alerts, success, error } = useAlert();
  const [loading, setLoading] = useState(true);
  const [unitData, setUnitData] = useState<any>(null);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const { data, error } = await supabase
          .from('units')
          .select('*')
          .eq('id', params.id)
          .eq('is_deleted', false)
          .single();

        if (error) throw error;
        setUnitData(data);
      } catch (error) {
        console.error('Error fetching unit:', error);
        router.push('/units');
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [params.id, router]);

  const handleSubmit = async (data: any) => {
    const { error: updateError } = await supabase
      .from('units')
      .update({
        nama: data.nama,
        jenis: data.jenis,
        plat_nomor: data.plat_nomor,
        harga_sewa_per_hari: data.harga_sewa_per_hari,
        status: data.status,
        image_url: data.image_url || null,
        tahun_produksi: data.tahun_produksi,
      })
      .eq('id', params.id);

    if (updateError) throw updateError;
    router.push(`/units/${params.id}`);
  };

  const handleDelete = async () => {
    try {
      // Check if unit status is "disewa"
      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select('status')
        .eq('id', params.id)
        .single();

      if (unitError) throw unitError;

      if (unitData.status === 'disewa') {
        error('Unit tidak dapat dihapus karena status masih disewa');
        return;
      }

      // Check if there are any active rentals for this unit
      const { data: activeRentals, error: rentalsError } = await supabase
        .from('rentals')
        .select('id')
        .eq('unit_id', params.id)
        .eq('status', 'berlangsung')
        .eq('is_deleted', false);

      if (rentalsError) throw rentalsError;

      if (activeRentals && activeRentals.length > 0) {
        error('Unit tidak dapat dihapus karena memiliki penyewaan yang sedang berlangsung');
        return;
      }

      // Soft delete the unit
      const { error: updateError } = await supabase
        .from('units')
        .update({ is_deleted: true })
        .eq('id', params.id);

      if (updateError) throw updateError;

      // Soft delete all rentals associated with this unit
      const { error: rentalsUpdateError } = await supabase
        .from('rentals')
        .update({ is_deleted: true })
        .eq('unit_id', params.id);

      if (rentalsUpdateError) throw rentalsUpdateError;

      success('Unit berhasil dihapus');
      setTimeout(() => {
        router.push('/units');
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting unit:', err);
      error('Gagal menghapus unit. Silakan coba lagi.');
    }
  };

  if (loading) {
    return (
      <SidebarLayout
        title="Edit Unit Kendaraan"
        description="Memuat data unit..."
        action={
          <button
            onClick={() => router.push('/units')}
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            Kembali
          </button>
        }
      >
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!unitData) {
    return (
      <SidebarLayout
        title="Edit Unit Kendaraan"
        description="Unit tidak ditemukan"
        action={
          <button
            onClick={() => router.push('/units')}
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            Kembali
          </button>
        }
      >
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-8">
          <p className="text-muted-foreground">Unit tidak ditemukan.</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <>
      <AlertContainer alerts={alerts} />
      <SidebarLayout
        title="Edit Unit Kendaraan"
        description="Edit data unit kendaraan yang sudah ada."
        action={
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            Kembali
          </button>
        }
      >
        <UnitForm
          mode="edit"
          initialData={{
            id: unitData.id,
            nama: unitData.nama,
            jenis: unitData.jenis,
            plat_nomor: unitData.plat_nomor,
            harga_sewa_per_hari: unitData.harga_sewa_per_hari,
            status: unitData.status,
            image_url: unitData.image_url,
            tahun_produksi: unitData.tahun_produksi,
          }}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onCancel={() => router.push(`/units/${params.id}`)}
        />
      </SidebarLayout>
    </>
  );
}
