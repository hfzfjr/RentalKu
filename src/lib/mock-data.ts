export type UnitStatus = "tersedia" | "disewa";
export type JenisKendaraan = "motor" | "mobil";
export type PenyewaanStatus = "berlangsung" | "selesai";

export interface Unit {
  id: string;
  nama: string;
  jenis: JenisKendaraan;
  platNomor: string;
  hargaSewaPerHari: number;
  status: UnitStatus;
  imageUrl?: string;
}

export interface Penyewa {
  id: string;
  nama: string;
  noHp: string;
  alamat: string;
  noKtp: string;
}

export interface Penyewaan {
  id: string;
  unitId: string;
  penyewaId: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: PenyewaanStatus;
}

export const mockUnits: Unit[] = [
  {
    id: "1",
    nama: "Honda Beat 2022",
    jenis: "motor",
    platNomor: "B 1234 ABC",
    hargaSewaPerHari: 70000,
    status: "tersedia",
  },
  {
    id: "2",
    nama: "Yamaha NMAX 2023",
    jenis: "motor",
    platNomor: "B 5678 XYZ",
    hargaSewaPerHari: 120000,
    status: "tersedia",
  },
  {
    id: "3",
    nama: "Toyota Avanza 2021",
    jenis: "mobil",
    platNomor: "B 9012 DEF",
    hargaSewaPerHari: 350000,
    status: "disewa",
  },
  {
    id: "4",
    nama: "Honda Brio 2022",
    jenis: "mobil",
    platNomor: "B 3456 GHI",
    hargaSewaPerHari: 300000,
    status: "tersedia",
  },
];

export const mockPenyewa: Penyewa[] = [
  {
    id: "1",
    nama: "Budi Santoso",
    noHp: "081234567890",
    alamat: "Jl. Merdeka No. 10, Jakarta",
    noKtp: "3171234567890001",
  },
  {
    id: "2",
    nama: "Siti Rahayu",
    noHp: "082345678901",
    alamat: "Jl. Sudirman No. 25, Jakarta",
    noKtp: "3172345678900002",
  },
  {
    id: "3",
    nama: "Ahmad Wijaya",
    noHp: "083456789012",
    alamat: "Jl. Thamrin No. 15, Jakarta",
    noKtp: "3173456789010003",
  },
];

export const mockPenyewaan: Penyewaan[] = [
  {
    id: "1",
    unitId: "3",
    penyewaId: "1",
    tanggalMulai: "2023-10-12",
    tanggalSelesai: "2023-10-15",
    status: "selesai",
  },
  {
    id: "2",
    unitId: "1",
    penyewaId: "2",
    tanggalMulai: "2023-10-14",
    tanggalSelesai: "2023-10-16",
    status: "berlangsung",
  },
];
