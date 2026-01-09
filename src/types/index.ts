export type UserRole = 'admin' | 'user';

export interface Pelanggan {
  id: number;
  id_user: number;
  nik: string;
  alamat: string;
  telp: string;
}

export interface User {
  id: number;
  nama: string;
  username: string;
  email: string;
  role: UserRole;
  alamat?: string | null;
  telp?: string | null;
  foto?: string | null;
  pelanggan?: Pelanggan | null;
}

export interface Kategori {
  id: number;
  nama_kategori: string;
}

export interface Barang {
  id: number;
  id_kategori: number;
  nama_barang: string;
  deskripsi?: string | null;
  harga_sewa: number;
  stok: number;
  foto?: string | null;
  kategori?: Kategori;
}

export interface DetailSewa {
  id: number;
  id_barang: number;
  qty: number;
  harga: number;
  barang: Barang;
}

export interface Sewa {
  id: number;
  tanggal_sewa: string;
  tanggal_kembali: string;
  total_harga: number;
  status: 'pending' | 'dibayar' | 'dipinjam' | 'dikembalikan' | 'batal';
  bukti_bayar?: string | null;
  bukti_jemput?: string | null;
  catatan?: string | null;
  midtrans_order_id?: string | null;
  detail_sewa?: DetailSewa[];
}

export interface CartItem {
  barang: Barang;
  qty: number;
}


