"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { UnitForm } from "@/components/units/UnitForm";
import { AlertContainer } from "@/components/ui/alert";
import { useAlert } from "@/components/ui/alert";

export default function NewUnitPage() {
  const router = useRouter();
  const { alerts } = useAlert();

  const handleSubmit = async (data: any) => {
    const { error: insertError } = await supabase
      .from('units')
      .insert({
        nama: data.nama,
        jenis: data.jenis,
        plat_nomor: data.plat_nomor,
        harga_sewa_per_hari: data.harga_sewa_per_hari,
        status: data.status,
        image_url: data.image_url || null,
        tahun_produksi: data.tahun_produksi,
      });

    if (insertError) throw insertError;
    router.push("/units");
  };

  return (
    <>
      <AlertContainer alerts={alerts} />
      <SidebarLayout
        title="Tambah Unit Kendaraan"
        description="Tambah unit kendaraan baru ke dalam sistem."
        action={
          <button
            onClick={() => router.push("/units")}
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            Kembali
          </button>
        }
      >
        <UnitForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/units")}
        />
      </SidebarLayout>
    </>
  );
}
