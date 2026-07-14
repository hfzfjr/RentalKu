# RentalKu

Aplikasi manajemen rental kendaraan berbasis web yang memudahkan pengelolaan unit kendaraan, data penyewa, dan status penyewaan.

## Fitur

- **Manajemen Unit Kendaraan**
  - CRUD (Create, Read, Update, Delete) unit kendaraan
  - Upload foto kendaraan
  - Filter berdasarkan jenis kendaraan (mobil/motor) dan status ketersediaan
  - Soft delete untuk menjaga integritas data

- **Manajemen Data Penyewa**
  - CRUD data penyewa
  - Validasi data lengkap (nama, KTP, HP, alamat)
  - Soft delete dengan pengecekan penyewaan aktif

- **Manajemen Penyewaan**
  - Buat transaksi penyewaan baru
  - Lihat daftar penyewaan dengan filter status
  - Detail penyewaan lengkap dengan perhitungan harga
  - Selesaikan penyewaan dan update status unit otomatis

- **Dashboard**
  - Ringkasan statistik (total unit, unit tersedia, unit disewa, total penyewa)
  - Daftar penyewaan terbaru

## Tech Stack

- **Framework**: Next.js 16.2.10 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks (useState, useEffect, useReducer)
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, atau bun
- Akun Supabase dengan project yang sudah disiapkan

## Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd rentalku
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
# atau
bun install
```

### 3. Environment Setup

Buat file .env.local di root project dan tambahkan:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

Jalankan SQL schema di file database.sql di Supabase SQL Editor untuk membuat tabel yang diperlukan:

```sql
-- Tabel: units, tenants, rentals
-- Kolom is_deleted sudah ditambahkan untuk soft delete
```

### 5. Run Development Server

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat aplikasi.

## Available Scripts

- ```bash npm run dev``` - Menjalankan development server
- ```bash npm run build``` - Build untuk production
- ```bash npm run lint``` - Run ESLint untuk code linting

## Struktur Project

```bash
rentalku/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── units/              # Unit management pages
│   │   │   ├── page.tsx        # Unit list
│   │   │   ├── [id]/           # Unit detail
│   │   │   │   └── page.tsx
│   │   │   ├── [id]/edit/      # Unit edit
│   │   │   │   └── page.tsx
│   │   │   └── new/            # Create new unit
│   │   │       └── page.tsx
│   │   ├── tenants/            # Tenant management pages
│   │   │   ├── page.tsx        # Tenant list
│   │   │   └── TenantDialog.tsx # Add/Edit tenant modal
│   │   ├── rentals/            # Rental management pages
│   │   │   ├── page.tsx        # Rental list
│   │   │   ├── [id]/           # Rental detail
│   │   │   │   └── page.tsx
│   │   │   └── new/            # Create new rental
│   │   │       └── page.tsx
│   │   └── page.tsx            # Dashboard
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components
│   │   ├── icons/              # Icon components
│   │   ├── units/              # Unit-specific components
│   │   └── tenants/            # Tenant-specific components
│   └── lib/
│       ├── supabase.ts         # Supabase client
│       ├── types.ts            # TypeScript types
│       └── utils.ts            # Utility functions
├── public/                     # Static assets
├── database.sql                # Database schema
└── package.json                # Dependencies
```

## Database Schema

### Units
- id: Primary key
- nama: Nama kendaraan
- jenis: Jenis (motor/mobil)
- plat_nomor: Plat nomor kendaraan
- harga_sewa_per_hari: Harga sewa per hari
- status: Status ketersediaan (tersedia/disewa)
- image_url: URL foto kendaraan
- tahun_produksi: Tahun produksi
- is_deleted: Soft delete flag
- created_at, updated_at: Timestamps

### Tenants
- id: Primary key
- nama: Nama lengkap penyewa
- no_ktp: Nomor KTP/NIK
- no_hp: Nomor HP
- alamat: Alamat lengkap
- is_deleted: Soft delete flag
- created_at, updated_at: Timestamps

### Rentals
- id: Primary key
- unit_id: Foreign key ke units
- tenant_id: Foreign key ke tenants
- tanggal_mulai: Tanggal mulai sewa
- tanggal_selesai: Tanggal selesai sewa
- status: Status penyewaan (berlangsung/selesai)
- catatan: Catatan tambahan
- is_deleted: Soft delete flag
- created_at, updated_at: Timestamps
