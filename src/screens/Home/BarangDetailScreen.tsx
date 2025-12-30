import React from 'react';
import { RouteProp } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { useCart } from '../../context/CartContext';
import { Barang } from '../../types';

interface Props {
  route: RouteProp<{ params: { barang: Barang } }, 'params'>;
}

const BarangDetailScreen: React.FC<Props> = ({ route }) => {
  const { barang } = route.params;
  const { addToCart } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{barang.nama_barang}</Text>
        <Text style={styles.category}>{barang.kategori?.nama_kategori}</Text>
        <Text style={styles.price}>
          Rp {barang.harga_sewa.toLocaleString('id-ID')} / hari
        </Text>
        <Text style={styles.label}>Deskripsi</Text>
        <Text style={styles.desc}>{barang.deskripsi ?? '-'}</Text>
        <Text style={styles.label}>Stok tersedia: {barang.stok}</Text>
      </View>
      <PrimaryButton title="Tambah ke Keranjang" onPress={() => addToCart(barang)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  category: {
    color: '#6B7280',
    marginTop: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#2563EB',
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    color: '#111827',
  },
  desc: {
    marginTop: 4,
    color: '#374151',
    lineHeight: 20,
  },
});

export default BarangDetailScreen;


