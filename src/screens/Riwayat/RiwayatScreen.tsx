import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../api/client';
import { API_BASE_URL, ENDPOINTS } from '../../config/api';
import { Sewa } from '../../types';
import { useAuth } from '../../context/AuthContext';
import PrimaryButton from '../../components/PrimaryButton';

import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/Theme';

const RiwayatScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const [data, setData] = useState<Sewa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const statusOptions = ['pending', 'dibayar', 'dipinjam', 'dikembalikan', 'batal'];

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiClient.get<{ data: Sewa[] }>(`${ENDPOINTS.SEWA}/me`);
      setData(res.data.data ?? res.data);
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 20 }}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>📜</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 }}>
          Riwayat Transaksi
        </Text>
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginBottom: 30, lineHeight: 20 }}>
          Silakan masuk untuk melihat riwayat penyewaan dan status pembayaran Anda.
        </Text>
        <PrimaryButton
          title="Login Sekarang"
          onPress={() => navigation.navigate('Login')}
          style={{ width: '100%' }}
        />
      </View>
    );
  }

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const downloadInvoice = async (id: number) => {
    try {
      const url = `${API_BASE_URL}/sewa/${id}/invoice`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.warn('Failed to download invoice', error);
    }
  };

  const syncStatus = async (orderId: string) => {
    try {
      setLoading(true);
      await apiClient.get(`/payment/status/${orderId}`);
      await fetchData();
    } catch (error: any) {
      console.warn('Sync status failed', error);
      Alert.alert('Gagal', 'Gagal memperbarui status. Pastikan Anda sudah menyelesaikan pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: COLORS.warning,
      dibayar: COLORS.success,
      dipinjam: COLORS.primary,
      dikembalikan: COLORS.textSecondary,
      batal: COLORS.error,
    };
    return colors[status] || COLORS.textSecondary;
  };

  const filteredData = selectedStatus
    ? data.filter(item => item.status === selectedStatus)
    : data;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Filter Status */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusOptions}
          keyExtractor={item => item}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterBadge,
                selectedStatus === item && styles.filterBadgeActive,
              ]}
              onPress={() =>
                setSelectedStatus(prev => (prev === item ? null : item))
              }>
              <Text
                style={[
                  styles.filterBadgeText,
                  selectedStatus === item && styles.filterBadgeTextActive,
                ]}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedStatus
                ? `Tidak ada transaksi dengan status "${selectedStatus}"`
                : 'Belum ada riwayat transaksi'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderId}>TRX-{item.id}</Text>
                <Text style={styles.dateText}>{item.tanggal_sewa} - {item.tanggal_kembali}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + '20' },
                ]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Pembayaran</Text>
              <Text style={styles.priceValue}>
                Rp {item.total_harga.toLocaleString('id-ID')}
              </Text>
            </View>

            {item.catatan && (
              <View style={styles.noteBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="create-outline" size={14} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.noteText}>{item.catatan}</Text>
                </View>
              </View>
            )}

            <View style={styles.actionRow}>
              {/* Download Invoice Button */}
              {(item.status === 'dibayar' ||
                item.status === 'dipinjam' ||
                item.status === 'dikembalikan') && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => downloadInvoice(item.id)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="document-text-outline" size={16} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
                      <Text style={styles.actionBtnText}>Invoice</Text>
                    </View>
                  </TouchableOpacity>
                )}

              {/* Check Status Button for Midtrans Pending orders */}
              {item.status === 'pending' && item.midtrans_order_id && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.secondary }]}
                  onPress={() => syncStatus(item.midtrans_order_id!)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="sync-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={[styles.actionBtnText, { color: '#fff' }]}>Cek Status</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: '#fff',
    marginRight: 10,
    ...SHADOWS.soft,
  },
  filterBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  filterBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterBadgeTextActive: {
    color: '#fff',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  noteBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: 16,
  },
  noteText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionBtnText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default RiwayatScreen;
