import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../config/api';
import { useCart } from '../../context/CartContext';

interface Props {
  navigation: any;
}

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

    if (result.assets && result.assets[0]) {
      setFotoKtp(result.assets[0]);
    }
  };

  if (!items.length) {
    Alert.alert('Keranjang kosong', 'Tambahkan barang terlebih dahulu.');
    return;
  }

  if (totalPrice <= 0) {
    Alert.alert('Harga Tidak Valid', 'Total harga tidak boleh Rp 0. Pastikan harga barang sudah diatur.');
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
    if (catatan) {
      formData.append('catatan', catatan);
    }

    // Append foto KTP
    formData.append('foto_ktp', {
      uri: fotoKtp.uri,
      type: fotoKtp.type || 'image/jpeg',
      name: fotoKtp.fileName || 'ktp.jpg',
    } as any);

    // Append items
    items.forEach((item, index) => {
      formData.append(`items[${index}][id_barang]`, item.barang.id.toString());
      formData.append(`items[${index}][qty]`, item.qty.toString());
    });

    const res = await apiClient.post(SEWA, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const lastSewa = res.data.data ?? res.data;

    await clear();
    setFotoKtp(null);
    Alert.alert('Berhasil', 'Pemesanan berhasil dibuat.', [
      {
        text: 'Pilih Metode Pembayaran',
        onPress: () => {
          Alert.alert(
            'Metode Pembayaran',
            'Pilih cara pembayaran Anda',
            [
              { text: 'Manual (Upload Bukti)', onPress: () => navigation.navigate('Pembayaran') },
              { text: 'Online (Midtrans)', onPress: () => handleMidtransPayAfterSubmit(lastSewa.id) }
            ]
          );
        },
      },
    ]);
  } catch (error: any) {
    Alert.alert('Gagal', error?.response?.data?.message ?? 'Gagal membuat sewa');
  } finally {
    setLoading(false);
  }
};

const handleMidtransPayAfterSubmit = async (sewaId: number) => {
  try {
    setLoading(true);
    const res = await apiClient.post('/payment/create-transaction', {
      sewa_id: sewaId,
    });

    const { snap_token, redirect_url } = res.data;

    navigation.navigate('MidtransPayment', {
      redirect_url,
      order_id: `RENT-${sewaId}`,
    });
  } catch (err: any) {
    Alert.alert(
      'Gagal',
      err?.response?.data?.message ?? 'Gagal membuat transaksi Midtrans',
    );
  } finally {
    setLoading(false);
  }
};

return (
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Periode Sewa</Text>
      <TouchableOpacity onPress={() => setShowMulai(true)}>
        <TextField label="Tanggal Sewa" value={toDateString(tanggalSewa)} editable={false} />
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
        label="Catatan"
        value={catatan}
        onChangeText={setCatatan}
        multiline
        placeholder="Contoh: butuh ekstra tali"
      />
    </View>

    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Upload Foto KTP</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>
          {fotoKtp ? '✓ Foto KTP Terpilih' : '📷 Pilih Foto KTP'}
        </Text>
      </TouchableOpacity>
      {fotoKtp && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: fotoKtp.uri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
            <Text style={styles.changeButtonText}>Ganti Foto</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.helperText}>* Foto KTP diperlukan untuk verifikasi</Text>
    </View>

    <View style={styles.summary}>
      <Text style={styles.sectionTitle}>Ringkasan</Text>
      {items.map(item => (
        <View style={styles.summaryRow} key={item.barang.id}>
          <Text>{item.barang.nama_barang}</Text>
          <Text>
            {item.qty} x Rp {item.barang.harga_sewa.toLocaleString('id-ID')}
          </Text>
        </View>
      ))}
      <View style={styles.summaryRow}>
        <Text style={{ fontWeight: 'bold' }}>Estimasi total per hari</Text>
        <Text style={{ fontWeight: 'bold' }}>
          Rp {totalPrice.toLocaleString('id-ID')}
        </Text>
      </View>
    </View>

    <PrimaryButton title="Buat Sewa" onPress={onSubmit} loading={loading} />
  </ScrollView>
);
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    backgroundColor: '#F3F4F6',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    color: '#111827',
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  imagePreview: {
    marginTop: 12,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  changeButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  changeButtonText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default CheckoutScreen;

