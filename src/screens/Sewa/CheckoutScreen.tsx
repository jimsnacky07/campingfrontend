// Force Refresh: Fixed Async Handler
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../config/api';
import { useCart } from '../../context/CartContext';

interface Props {
  navigation: any;
}

import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/Theme';

const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const { SEWA } = ENDPOINTS;
  const { items, clear, totalPrice } = useCart();
  const [tanggalSewa, setTanggalSewa] = useState(new Date());
  const [tanggalKembali, setTanggalKembali] = useState(new Date(Date.now() + 24 * 3600 * 1000));
  const [catatan, setCatatan] = useState('');
  const [fotoKtp, setFotoKtp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showMulai, setShowMulai] = useState(false);
  const [showSelesai, setShowSelesai] = useState(false);

  const toDateString = (date: Date) => date.toISOString().split('T')[0];

  const handleDateChange =
    (setter: (date: Date) => void, toggle: (val: boolean) => void) =>
      (_event: DateTimePickerEvent, date?: Date) => {
        toggle(false);
        if (date) {
          setter(date);
        }
      };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 800,
      maxHeight: 800,
    });

    if (result.didCancel) return;

    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Gagal memilih foto');
      return;
    }

    if (result.assets && result.assets[0]) {
      setFotoKtp(result.assets[0]);
    }
  };

  const handleSewaSubmit = async () => {
    if (!items.length) {
      Alert.alert('Keranjang kosong', 'Tambahkan barang terlebih dahulu.');
      return;
    }

    if (totalPrice <= 0) {
      Alert.alert('Harga Tidak Valid', 'Total harga tidak boleh Rp 0.');
      return;
    }

    if (!fotoKtp) {
      Alert.alert('Foto KTP Diperlukan', 'Silakan upload foto KTP terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('tanggal_sewa', toDateString(tanggalSewa));
      formData.append('tanggal_kembali', toDateString(tanggalKembali));
      if (catatan) formData.append('catatan', catatan);

      formData.append('foto_ktp', {
        uri: fotoKtp.uri,
        type: fotoKtp.type || 'image/jpeg',
        name: fotoKtp.fileName || 'ktp.jpg',
      } as any);

      items.forEach((item, i) => {
        formData.append(`items[${i}][id_barang]`, item.barang.id.toString());
        formData.append(`items[${i}][qty]`, item.qty.toString());
      });

      console.log('Submitting Sewa with FormData:', {
        tanggal_sewa: toDateString(tanggalSewa),
        tanggal_kembali: toDateString(tanggalKembali),
        catatan,
        foto_ktp: {
          uri: fotoKtp.uri,
          type: fotoKtp.type,
          name: fotoKtp.fileName
        }
      });

      const res = await apiClient.post(SEWA, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
          // Penting: Axios terkadang salah menyetel boundary jika header disetel manual.
          // Kita biarkan Axios yang menentukannya.
          return data;
        },
      });

      const lastSewa = res.data.data ?? res.data;
      await clear();
      setFotoKtp(null);

      Alert.alert('Pemesanan Berhasil', 'Pilih metode pembayaran untuk melanjutkan.', [
        {
          text: 'Pilih Metode',
          onPress: () => {
            Alert.alert(
              'Metode Pembayaran',
              'Ingin bayar manual atau otomatis?',
              [
                { text: 'Manual (Transfer)', onPress: () => navigation.navigate('Pembayaran') },
                { text: 'Online (Midtrans)', onPress: () => handleMidtransPayAfterSubmit(lastSewa.id) }
              ]
            );
          },
        },
      ]);
    } catch (error: any) {
      console.error('Sewa Submit Error:', error);
      if (error.response) {
        console.error('Error info:', error.response.data);
      }
      Alert.alert('Gagal', error?.response?.data?.message ?? 'Gagal membuat sewa');
    } finally {
      setLoading(false);
    }
  };

  const handleMidtransPayAfterSubmit = async (sewaId: number) => {
    try {
      setLoading(true);
      const res = await apiClient.post('/payment/create-transaction', { sewa_id: sewaId });
      const { redirect_url } = res.data;
      navigation.navigate('MidtransPayment', { redirect_url, order_id: `RENT-${sewaId}` });
    } catch (err: any) {
      Alert.alert('Gagal', err?.response?.data?.message ?? 'Gagal membuat transaksi Midtrans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: COLORS.background }} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Periode Penyewaan</Text>
        <TouchableOpacity onPress={() => setShowMulai(true)}>
          <TextField label="Mulai Sewa" value={toDateString(tanggalSewa)} editable={false} />
        </TouchableOpacity>
        {showMulai && (
          <DateTimePicker
            value={tanggalSewa}
            mode="date"
            onChange={handleDateChange(setTanggalSewa, setShowMulai)}
          />
        )}
        <TouchableOpacity onPress={() => setShowSelesai(true)}>
          <TextField
            label="Tanggal Kembali"
            value={toDateString(tanggalKembali)}
            editable={false}
          />
        </TouchableOpacity>
        {showSelesai && (
          <DateTimePicker
            value={tanggalKembali}
            mode="date"
            minimumDate={tanggalSewa}
            onChange={handleDateChange(setTanggalKembali, setShowSelesai)}
          />
        )}
        <TextField
          label="Catatan Tambahan"
          value={catatan}
          onChangeText={setCatatan}
          multiline
          placeholder="Tulis catatan jika ada..."
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Identitas (KTP)</Text>
        {!fotoKtp ? (
          <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImage}>
            <Ionicons name="camera" size={40} color={COLORS.primary} style={{ marginBottom: 8 }} />
            <Text style={styles.uploadText}>Klik untuk upload foto KTP</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.imagePreview}>
            <Image source={{ uri: fotoKtp.uri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
              <Text style={styles.changeBtnText}>Ganti Foto KTP</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.helperText}>* Data aman dan hanya untuk verifikasi sewa</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ringkasan Barang</Text>
        {items.map(item => (
          <View style={styles.summaryRow} key={item.barang.id}>
            <Text style={styles.summaryItemName}>{item.barang.nama_barang}</Text>
            <Text style={styles.summaryItemPrice}>
              {item.qty}x Rp{item.barang.harga_sewa.toLocaleString('id-ID')}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />

        {(() => {
          const start = new Date(tanggalSewa);
          const end = new Date(tanggalKembali);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          const grandTotal = totalPrice * diffDays;

          return (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total per hari</Text>
                <Text style={styles.summaryValue}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Lama Sewa</Text>
                <Text style={styles.summaryValue}>{diffDays} Hari</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Bayar</Text>
                <Text style={styles.totalValue}>Rp {grandTotal.toLocaleString('id-ID')}</Text>
              </View>
            </>
          );
        })()}
      </View>

      <PrimaryButton
        title="Konfirmasi & Bayar"
        onPress={handleSewaSubmit}
        loading={loading}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 20,
    ...SHADOWS.soft,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 20,
    color: COLORS.textPrimary,
  },
  uploadPlaceholder: {
    height: 160,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.lg,
    resizeMode: 'cover',
  },
  changeBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
  },
  changeBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryItemName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default CheckoutScreen;
