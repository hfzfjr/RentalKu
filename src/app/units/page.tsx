"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Unit, toCamelCase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

export default function UnitsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<"semua" | "mobil" | "motor">("semua");
  const [statusFilter, setStatusFilter] = useState<"semua" | "tersedia" | "disewa">("semua");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnits();
  }, []);

  async function fetchUnits() {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVehicleType = vehicleTypeFilter === "semua" || unit.jenis === vehicleTypeFilter;
    const matchesStatus = statusFilter === "semua" || unit.status === statusFilter;
    return matchesSearch && matchesVehicleType && matchesStatus;
  });

  const sortedUnits = [...filteredUnits].sort((a, b) => {
    if (sortBy === "terbaru") {
      return b.tahun_produksi - a.tahun_produksi;
    } else if (sortBy === "terlama") {
      return a.tahun_produksi - b.tahun_produksi;
    } else if (sortBy === "harga-tertinggi") {
      return b.harga_sewa_per_hari - a.harga_sewa_per_hari;
    } else if (sortBy === "harga-terendah") {
      return a.harga_sewa_per_hari - b.harga_sewa_per_hari;
    }
    return 0;
  });

  return (
    <SidebarLayout
      title="Unit Kendaraan"
      description="Kelola semua daftar kendaraan yang tersedia untuk disewakan."
      action={
        <Link href="/units/new">
          <Button>
            <Icons.Plus />Tambah Unit
          </Button>
        </Link>
      }
    >

      {/* Filters & Search */}
      <div className="bg-card border rounded-xl p-6 mb-8 shadow-sm">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex-1">
            <Input
              placeholder="Cari nama unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filter Groups */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Vehicle Type Filter */}
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground mb-3">Jenis Kendaraan</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={vehicleTypeFilter === "semua" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVehicleTypeFilter("semua")}
                  className="rounded-full"
                >
                  Semua
                </Button>
                <Button
                  variant={vehicleTypeFilter === "mobil" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVehicleTypeFilter("mobil")}
                  className="rounded-full"
                >
                  Mobil
                </Button>
                <Button
                  variant={vehicleTypeFilter === "motor" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVehicleTypeFilter("motor")}
                  className="rounded-full"
                >
                  Motor
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground mb-3">Status Ketersediaan</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === "semua" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("semua")}
                  className="rounded-full"
                >
                  Semua
                </Button>
                <Button
                  variant={statusFilter === "tersedia" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("tersedia")}
                  className="rounded-full"
                >
                  Tersedia
                </Button>
                <Button
                  variant={statusFilter === "disewa" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("disewa")}
                  className="rounded-full"
                >
                  Disewa
                </Button>
              </div>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <div className="text-sm font-medium text-foreground mb-3">Urutkan</div>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="harga-tertinggi">Harga Tertinggi</option>
                <option value="harga-terendah">Harga Terendah</option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-lg overflow-hidden flex flex-col">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 flex flex-col gap-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="mt-auto pt-3 border-t border-border/50">
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedUnits.length === 0 ? (
        <div className="text-center py-16">
          <Icons.NoData className="text-6xl mb-4 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Tidak ada unit ditemukan</h3>
          <p className="text-muted-foreground mb-6">Coba ubah kata kunci pencarian atau filter.</p>
          <Button onClick={() => { setSearchQuery(""); setVehicleTypeFilter("semua"); setStatusFilter("semua"); setSortBy("terbaru"); }}>
            Reset Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedUnits.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </SidebarLayout>
  );
}

function UnitCard({ unit }: { unit: Unit }) {
  const isAvailable = unit.status === "tersedia";
  const statusBadgeClass = isAvailable
    ? "bg-green-100 text-green-800 border-green-200"
    : "bg-orange-100 text-orange-800 border-orange-200";
  const statusDotClass = isAvailable ? "bg-green-800" : "bg-orange-800";
  const vehicleIcon = unit.jenis === "motor" ? "two_wheeler" : "directions_car";

  return (
    <div className="bg-card border rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all group">
      {/* Image Area */}
      <div className="h-40 relative bg-muted overflow-hidden">
        {unit.image_url ? (
          <img
            src={unit.image_url}
            alt={unit.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Icons.Car className="text-4xl text-muted-foreground" />
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${statusBadgeClass}`}>
          <span className={`w-2 h-2 rounded-full ${statusDotClass}`}></span>
          {unit.status === "tersedia" ? "Tersedia" : "Disewa"}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <div>
            <h3 className="font-semibold text-foreground">{unit.nama}</h3>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">{unit.tahun_produksi}</p>
              <span className="text-xs text-muted-foreground uppercase">{unit.plat_nomor}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-border/50">
          <p className="font-bold text-primary">
            Rp {unit.harga_sewa_per_hari.toLocaleString("id-ID")}{" "}
            <span className="text-muted-foreground font-normal text-sm">/ hari</span>
          </p>
        </div>

        <div className="flex gap-2 mt-2">
          <Link href={`/units/${unit.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Edit
            </Button>
          </Link>
          <Link href={`/units/${unit.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              Detail
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
