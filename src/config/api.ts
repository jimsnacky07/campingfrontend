export const BASE_URL = 'http://192.168.100.48:8000';
export const API_BASE_URL = `${BASE_URL}/api`;
export const IMAGE_BASE_URL = `${BASE_URL}/storage/`;

export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  MASTER: {
    KATEGORI: '/kategori',
    BARANG: '/barang',
    METODE_PEMBAYARAN: '/metode-pembayaran',
  },
  PELANGGAN: '/pelanggan',
  SEWA: '/sewa',
  PENGEMBALIAN: '/pengembalian',
  LAPORAN: {
    PENYEWAAN: '/laporan/penyewaan',
    PENDAPATAN: '/laporan/pendapatan-bulanan',
    BARANG_TERLARIS: '/laporan/barang-terlaris',
  },
};

export const buildUrl = (path: string) => `${API_BASE_URL}${path}`;


