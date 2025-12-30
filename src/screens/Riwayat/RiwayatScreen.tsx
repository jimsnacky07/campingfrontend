import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import apiClient from '../../api/client';
import { API_BASE_URL, ENDPOINTS } from '../../config/api';
import { Sewa } from '../../types';

const RiwayatScreen: React.FC = () => {
  const [data, setData] = useState<Sewa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const statusOptions = ['pending', 'dibayar', 'dipinjam', 'dikembalikan', 'batal'];

  const fetchData = async () => {
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
  }, []);

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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#FCD34D',
      dibayar: '#60A5FA',
      dipinjam: '#34D399',
      dikembalikan: '#9CA3AF',
      batal: '#F87171',
    };
    return colors[status] || '#9CA3AF';
  };

  const filteredData = selectedStatus
    ? data.filter(item => item.status === selectedStatus)
    : data;

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
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
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
        {selectedStatus && (
          <TouchableOpacity
            style={styles.clearFilter}
            onPress={() => setSelectedStatus(null)}>
            <Text style={styles.clearFilterText}>Clear Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
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
            <View style={styles.header}>
              <Text style={styles.title}>Transaksi #{item.id}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}>
                <Text style={styles.badgeText}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.sub}>
              {item.tanggal_sewa} - {item.tanggal_kembali}
            </Text>
            <Text style={styles.price}>
              Rp {item.total_harga.toLocaleString('id-ID')}
            </Text>

            {item.catatan && (
              <Text style={styles.note}>Catatan: {item.catatan}</Text>
            )}

            {/* Download Invoice Button */}
            {(item.status === 'dibayar' ||
              item.status === 'dipinjam' ||
              item.status === 'dikembalikan') && (
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => downloadInvoice(item.id)}>
                <Text style={styles.downloadBtnText}>📄 Download Invoice</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterBadgeActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterBadgeText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
  },
  filterBadgeTextActive: {
    color: '#fff',
  },
  clearFilter: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  clearFilterText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sub: {
    color: '#6B7280',
    marginVertical: 4,
    fontSize: 14,
  },
  price: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 4,
  },
  note: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  downloadBtn: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  downloadBtnText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default RiwayatScreen;
