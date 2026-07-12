"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Tenant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TenantDialog } from "@/components/tenants/TenantDialog";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | undefined>(undefined);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTenants = tenants.filter((tenant) =>
    tenant.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.no_hp.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ["bg-primary/10 text-primary", "bg-tertiary/10 text-tertiary"];
    return colors[index % colors.length];
  };

  const handleOpenAddDialog = () => {
    setEditingTenant(undefined);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsDialogOpen(true);
  };

  const handleSaveTenant = async (tenantData: Omit<Tenant, "id" | "created_at" | "updated_at">) => {
    try {
      if (editingTenant) {
        // Edit mode - update existing tenant
        const { error } = await supabase
          .from('tenants')
          .update(tenantData)
          .eq('id', editingTenant.id);
        if (error) throw error;
      } else {
        // Add mode - create new tenant
        const { error } = await supabase
          .from('tenants')
          .insert(tenantData);
        if (error) throw error;
      }
      await fetchTenants();
      setIsDialogOpen(false);
      setEditingTenant(undefined);
    } catch (error) {
      console.error('Error saving tenant:', error);
    }
  };

  const handleOpenDeleteDialog = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setShowDeleteDialog(true);
  };

  const handleDeleteTenant = async () => {
    if (tenantToDelete) {
      try {
        const { error } = await supabase
          .from('tenants')
          .delete()
          .eq('id', tenantToDelete.id);
        if (error) throw error;
        await fetchTenants();
        setShowDeleteDialog(false);
        setTenantToDelete(undefined);
      } catch (error) {
        console.error('Error deleting tenant:', error);
      }
    }
  };

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <SidebarLayout
      title="Data Penyewa"
      description="Kelola data penyewa kendaraan."
      action={
        <Button onClick={handleOpenAddDialog}>
          + Tambah Penyewa
        </Button>
      }
    >

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <span>🔍</span>
          </div>
          <input
            type="text"
            placeholder="Cari nama atau no. HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Data Table / Cards */}
      {filteredTenants.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery ? "Tidak ditemukan" : "Belum ada data penyewa"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? "Coba kata kunci lain untuk mencari penyewa."
              : "Mulai dengan menambahkan data penyewa pertama Anda."}
          </p>
          {!searchQuery && (
            <Button onClick={handleOpenAddDialog}>+ Tambah Penyewa</Button>
          )}
        </div>
      ) : (
        <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nama Penyewa
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    No. HP
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    No. KTP
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedTenants.map((tenant, index) => (
                  <tr key={tenant.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center font-bold text-sm`}>
                          {getInitials(tenant.nama)}
                        </div>
                        <span className="font-medium text-foreground">{tenant.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{tenant.no_hp}</td>
                    <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{tenant.no_ktp}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-50 truncate">{tenant.alamat}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditDialog(tenant)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDialog(tenant)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y">
            {paginatedTenants.map((tenant, index) => (
              <div key={tenant.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center font-bold text-sm`}>
                      {getInitials(tenant.nama)}
                    </div>
                    <span className="font-medium text-foreground">{tenant.nama}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditDialog(tenant)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleOpenDeleteDialog(tenant)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">No. HP</p>
                    <p className="text-sm text-foreground">{tenant.no_hp}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">No. KTP</p>
                    <p className="text-sm font-mono text-foreground truncate">{tenant.no_ktp}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Alamat</p>
                    <p className="text-sm text-foreground">{tenant.alamat}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="bg-muted border-t px-6 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Menampilkan {paginatedTenants.length} dari {filteredTenants.length} data
            </span>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded text-muted-foreground hover:bg-muted disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ←
              </button>
              <span className="text-sm text-foreground">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                className="p-2 rounded text-muted-foreground hover:bg-muted disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Dialog */}
      <TenantDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTenant(undefined);
        }}
        onSave={handleSaveTenant}
        tenant={editingTenant}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && tenantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
          />
          <div className="relative bg-card border rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Hapus Penyewa
            </h3>
            <p className="text-muted-foreground mb-6">
              Apakah Anda yakin ingin menghapus penyewa "{tenantToDelete.nama}"? Tindakan ini tidak dapat dibatalkan.
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
                onClick={handleDeleteTenant}
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
