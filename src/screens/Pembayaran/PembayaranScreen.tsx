import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import apiClient from '../../api/client';
import { API_BASE_URL, ENDPOINTS } from '../../config/api';
import { Sewa } from '../../types';

const PembayaranScreen: React.FC = () => {
  const [data, setData] = useState<Sewa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const navigation = useNavigation<any>();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{ data: Sewa[] }>(`${ENDPOINTS.SEWA}/me`);
      const list = res.data.data ?? res.data;
      // Filter only pending or need upload
      const filtered = list.filter(
        item => item.status === 'pending' || !item.bukti_bayar
      );
      setData(filtered);
    } catch (error) {
      console.warn('Failed fetch sewa', error);
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

  const handleUpload = async (sewaId: number) => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Gagal memilih foto');
        return;
      }

      if (!result.assets || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('bukti_bayar', {
        uri: asset.uri,
        name: asset.fileName ?? 'bukti.jpg',
        type: asset.type ?? 'image/jpeg',
      } as any);

      setUploadingId(sewaId);
      await apiClient.post(`/sewa/${sewaId}/upload-bukti`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Berhasil', 'Bukti bayar diunggah, menunggu validasi.');
      fetchData();
    } catch (err: any) {
      Alert.alert(
        'Gagal',
        err?.response?.data?.message ?? 'Gagal upload bukti',
      );
    } finally {
      setUploadingId(null);
    }
  };

  const handleMidtransPayment = async (sewaId: number) => {
    try {
      setPayingId(sewaId);
      const res = await apiClient.post('/payment/create-transaction', {
        sewa_id: sewaId,
      });

      const { snap_token, redirect_url } = res.data;

      navigation.navigate('MidtransPayment', {
        redirect_url,
        order_id: `RENT-${sewaId}`, // This might be simplified, but compatible with logic
      });
    } catch (err: any) {
      Alert.alert(
        'Gagal',
        err?.response?.data?.message ?? 'Gagal membuat transaksi Midtrans',
      );
    } finally {
      setPayingId(null);
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Tidak ada transaksi yang perlu dibayar.
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

            {item.bukti_bayar && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Bukti Transfer:</Text>
                <Image
                  source={{
                    uri: `${API_BASE_URL.replace('/api', '')}/storage/${item.bukti_bayar
                      }`,
                  }}
                  style={styles.preview}
                  resizeMode="cover"
                />
              </View>
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  uploadingId === item.id && styles.btnDisabled,
                ]}
                onPress={() => handleUpload(item.id)}
                disabled={uploadingId === item.id || payingId === item.id}>
                {uploadingId === item.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>
                    {item.bukti_bayar ? 'Ganti Bukti' : 'Upload Bukti'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.midtransBtn,
                  payingId === item.id && styles.btnDisabled,
                ]}
                onPress={() => handleMidtransPayment(item.id)}
                disabled={payingId === item.id || uploadingId === item.id}>
                {payingId === item.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Bayar Online</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  previewContainer: {
    marginTop: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  preview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  midtransBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default PembayaranScreen;
