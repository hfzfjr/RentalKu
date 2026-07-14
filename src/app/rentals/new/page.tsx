"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Unit, Tenant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertContainer, useAlert } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function NewRentalPage() {
  const router = useRouter();
  const { alerts, success, error } = useAlert();
  const [formData, setFormData] = useState({
    unit_id: "",
    tenant_id: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitSearch, setUnitSearch] = useState("");
  const [tenantSearch, setTenantSearch] = useState("");
  const [unitPopoverOpen, setUnitPopoverOpen] = useState(false);
  const [tenantPopoverOpen, setTenantPopoverOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    formData.tanggal_mulai ? new Date(formData.tanggal_mulai) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    formData.tanggal_selesai ? new Date(formData.tanggal_selesai) : undefined
  );

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
    // Clear touched state for this field when user starts typing
    setTouchedFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(name);
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all required fields as touched
    const newTouchedFields = new Set(touchedFields);
    if (!formData.unit_id) newTouchedFields.add('unit_id');
    if (!formData.tenant_id) newTouchedFields.add('tenant_id');
    if (!formData.tanggal_mulai) newTouchedFields.add('tanggal_mulai');
    if (!formData.tanggal_selesai) newTouchedFields.add('tanggal_selesai');
    setTouchedFields(newTouchedFields);

    if (!isFormValid) {
      error("Mohon lengkapi semua field yang wajib diisi");
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
        });

      if (rentalError) throw rentalError;

      // Update unit status to "disewa"
      const { error: unitError } = await supabase
        .from('units')
        .update({ status: 'disewa' })
        .eq('id', formData.unit_id);

      if (unitError) throw unitError;

      success("Penyewaan berhasil dibuat!");
      // Redirect to /rentals
      router.push("/rentals");
    } catch (err) {
      console.error('Error creating rental:', err);
      error("Gagal membuat penyewaan. Silakan coba lagi.");
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
    <>
      <AlertContainer alerts={alerts} />
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
                      Pilih Unit Kendaraan
                      {touchedFields.has("unit_id") && !formData.unit_id && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </label>
                    <Popover open={unitPopoverOpen} onOpenChange={setUnitPopoverOpen}>
                      <PopoverTrigger>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {formData.unit_id
                            ? availableUnits.find((unit) => unit.id === formData.unit_id)?.nama
                            : "Pilih kendaraan..."}
                          <Icons.ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Cari kendaraan..."
                            value={unitSearch}
                            onValueChange={setUnitSearch}
                          />
                          <CommandList>
                            <CommandEmpty>Tidak ada unit tersedia</CommandEmpty>
                            <CommandGroup>
                              {availableUnits.map((unit) => (
                                <CommandItem
                                  key={unit.id}
                                  value={unit.nama}
                                  onSelect={() => {
                                    setFormData((prev) => ({ ...prev, unit_id: unit.id }));
                                    setUnitPopoverOpen(false);
                                    setUnitSearch("");
                                  }}
                                >
                                  <Icons.Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.unit_id === unit.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {unit.nama} ({unit.plat_nomor}) - Rp {unit.harga_sewa_per_hari.toLocaleString("id-ID")}/hari
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Tenant Selection */}
                  <div>
                    <label htmlFor="tenant_id" className="block text-sm font-medium text-muted-foreground mb-2">
                      Pilih Penyewa
                      {touchedFields.has("tenant_id") && !formData.tenant_id && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </label>
                    <Popover open={tenantPopoverOpen} onOpenChange={setTenantPopoverOpen}>
                      <PopoverTrigger>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {formData.tenant_id
                            ? tenants.find((tenant) => tenant.id === formData.tenant_id)?.nama
                            : "Cari nama penyewa..."}
                          <Icons.ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Cari nama atau no HP..."
                            value={tenantSearch}
                            onValueChange={setTenantSearch}
                          />
                          <CommandList>
                            <CommandEmpty>Tidak ada penyewa tersedia</CommandEmpty>
                            <CommandGroup>
                              {tenants.map((tenant) => (
                                <CommandItem
                                  key={tenant.id}
                                  value={tenant.nama}
                                  onSelect={() => {
                                    setFormData((prev) => ({ ...prev, tenant_id: tenant.id }));
                                    setTenantPopoverOpen(false);
                                    setTenantSearch("");
                                  }}
                                >
                                  <Icons.Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.tenant_id === tenant.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {tenant.nama} ({tenant.no_hp})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                      Tanggal Mulai
                      {touchedFields.has("tanggal_mulai") && !formData.tanggal_mulai && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </label>
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.tanggal_mulai && "text-muted-foreground"
                          )}
                        >
                          <Icons.Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          onSelect={(date) => {
                            setStartDate(date);
                            setFormData((prev) => {
                              const newFormData = {
                                ...prev,
                                tanggal_mulai: date ? date.toISOString().split('T')[0] : "",
                              };
                              // Reset end date if it becomes invalid (<= new start date)
                              if (date && prev.tanggal_selesai) {
                                const newStartDate = new Date(date.toISOString().split('T')[0]);
                                const currentEndDate = new Date(prev.tanggal_selesai);
                                if (currentEndDate <= newStartDate) {
                                  setEndDate(undefined);
                                  return { ...newFormData, tanggal_selesai: "" };
                                }
                              }
                              return newFormData;
                            });
                            setStartDateOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div>
                    <label htmlFor="tanggal_selesai" className="block text-sm font-medium text-muted-foreground mb-2">
                      Tanggal Selesai
                      {touchedFields.has("tanggal_selesai") && !formData.tanggal_selesai && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </label>
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                      <PopoverTrigger>
                        <Button
                          variant="outline"
                          disabled={!formData.tanggal_mulai}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.tanggal_selesai && "text-muted-foreground"
                          )}
                          title={!formData.tanggal_mulai ? "Pilih Tanggal Mulai terlebih dahulu" : undefined}
                        >
                          <Icons.Calendar className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          disabled={(date) => {
                            if (!startDate) return true;
                            const minDate = new Date(startDate);
                            minDate.setDate(minDate.getDate() + 1);
                            return date < minDate;
                          }}
                          onSelect={(date) => {
                            setEndDate(date);
                            setFormData((prev) => ({
                              ...prev,
                              tanggal_selesai: date ? date.toISOString().split('T')[0] : "",
                            }));
                            setEndDateOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
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
                    {selectedUnit?.jenis === "motor" ? (
                      <Icons.Motorcycle className="w-6 h-6" />
                    ) : (
                      <Icons.Car className="w-6 h-6" />
                    )}
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
    </>
  );
}
