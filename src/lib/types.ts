export type UnitStatus = "tersedia" | "disewa";
export type JenisKendaraan = "motor" | "mobil";
export type PenyewaanStatus = "berlangsung" | "selesai";

export interface Unit {
  id: string;
  nama: string;
  jenis: JenisKendaraan;
  plat_nomor: string;
  harga_sewa_per_hari: number;
  status: UnitStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  tahun_produksi: number;
}

export interface Tenant {
  id: string;
  nama: string;
  no_hp: string;
  alamat: string;
  no_ktp: string;
  created_at: string;
  updated_at: string;
}

export interface Rental {
  id: string;
  unit_id: string;
  tenant_id: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: PenyewaanStatus;
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to convert database row to camelCase (for UI)
export function toCamelCase<T>(obj: any): T {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase<T>(item)) as T;
  }

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
    }
  }
  return result as T;
}

// Helper to convert camelCase to snake_case (for database)
export function toSnakeCase<T>(obj: any): T {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase<T>(item)) as T;
  }

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
    }
  }
  return result as T;
}
