"use client";

import { useState } from "react";
import Link from "next/link";
import { mockUnits } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

export default function UnitsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");

  const filteredUnits = mockUnits.filter((unit) =>
    unit.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUnits = [...filteredUnits].sort((a, b) => {
    if (sortBy === "terbaru") {
      return b.id.localeCompare(a.id);
    } else if (sortBy === "terlama") {
      return a.id.localeCompare(b.id);
    } else if (sortBy === "harga-tertinggi") {
      return b.hargaSewaPerHari - a.hargaSewaPerHari;
    } else if (sortBy === "harga-terendah") {
      return a.hargaSewaPerHari - b.hargaSewaPerHari;
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
            + Tambah Unit
          </Button>
        </Link>
      }
    >

      {/* Filters & Search */}
      <div className="bg-card border rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full">
            <Input
              placeholder="Cari nama unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <Button variant="default" size="sm" className="rounded-full">
              Semua
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              Tersedia
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              Disewa
            </Button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-muted-foreground">Urutkan:</span>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="harga-tertinggi">Harga Tertinggi</option>
              <option value="harga-terendah">Harga Terendah</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      {sortedUnits.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Tidak ada unit ditemukan</h3>
          <p className="text-muted-foreground mb-6">Coba ubah kata kunci pencarian atau filter.</p>
          <Button onClick={() => { setSearchQuery(""); setSortBy("terbaru"); }}>
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

function UnitCard({ unit }: { unit: typeof mockUnits[0] }) {
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
        {unit.imageUrl ? (
          <img
            src={unit.imageUrl}
            alt={unit.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-4xl text-muted-foreground">🚗</span>
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${statusBadgeClass}`}>
          <span className={`w-2 h-2 rounded-full ${statusDotClass}`}></span>
          {unit.status === "tersedia" ? "Tersedia" : "Disewa"}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-foreground">{unit.nama}</h3>
            <p className="text-xs text-muted-foreground mt-1">{unit.platNomor}</p>
          </div>
          <span className="text-muted-foreground bg-muted p-1.5 rounded-md text-sm">
            {vehicleIcon === "two_wheeler" ? "🏍️" : "🚗"}
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-border/50">
          <p className="font-bold text-primary">
            Rp {unit.hargaSewaPerHari.toLocaleString("id-ID")}{" "}
            <span className="text-muted-foreground font-normal text-sm">/ hari</span>
          </p>
        </div>

        <div className="flex gap-2 mt-2">
          <Link href={`/units/${unit.id}`} className="flex-1">
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
