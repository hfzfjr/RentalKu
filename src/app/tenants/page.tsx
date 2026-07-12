"use client";

import { useState } from "react";
import { mockPenyewa, Penyewa } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { TenantDialog } from "@/components/TenantDialog";

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Penyewa | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Penyewa | undefined>(undefined);
  const [tenants, setTenants] = useState(mockPenyewa);

  const filteredTenants = tenants.filter((tenant) =>
    tenant.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.noHp.includes(searchQuery)
  );

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

  const handleOpenEditDialog = (tenant: Penyewa) => {
    setEditingTenant(tenant);
    setIsDialogOpen(true);
  };

  const handleSaveTenant = (tenantData: Omit<Penyewa, "id">) => {
    if (editingTenant) {
      // Edit mode - update existing tenant
      setTenants((prev) =>
        prev.map((t) =>
          t.id === editingTenant.id ? { ...t, ...tenantData } : t
        )
      );
    } else {
      // Add mode - create new tenant
      const newTenant: Penyewa = {
        id: Date.now().toString(),
        ...tenantData,
      };
      setTenants((prev) => [...prev, newTenant]);
    }
    setIsDialogOpen(false);
    setEditingTenant(undefined);
  };

  const handleOpenDeleteDialog = (tenant: Penyewa) => {
    setTenantToDelete(tenant);
    setShowDeleteDialog(true);
  };

  const handleDeleteTenant = () => {
    if (tenantToDelete) {
      setTenants((prev) => prev.filter((t) => t.id !== tenantToDelete.id));
      setShowDeleteDialog(false);
      setTenantToDelete(undefined);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Data Penyewa</h1>
          <p className="text-muted-foreground mt-1">Kelola data penyewa kendaraan.</p>
        </div>
        <Button onClick={handleOpenAddDialog} className="hidden md:flex">
          + Tambah Penyewa
        </Button>
      </div>

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
                {filteredTenants.map((tenant, index) => (
                  <tr key={tenant.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center font-bold text-sm`}>
                          {getInitials(tenant.nama)}
                        </div>
                        <span className="font-medium text-foreground">{tenant.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{tenant.noHp}</td>
                    <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{tenant.noKtp}</td>
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
            {filteredTenants.map((tenant, index) => (
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
                    <p className="text-sm text-foreground">{tenant.noHp}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">No. KTP</p>
                    <p className="text-sm font-mono text-foreground truncate">{tenant.noKtp}</p>
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
              Menampilkan {filteredTenants.length} dari {tenants.length} data
            </span>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded text-muted-foreground hover:bg-muted disabled:opacity-50" disabled>
                ←
              </button>
              <span className="text-sm text-foreground">1 / 1</span>
              <button className="p-2 rounded text-muted-foreground hover:bg-muted disabled:opacity-50" disabled>
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
    </div>
  );
}
