import React from 'react';
import { RouteProp } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../../components/PrimaryButton';
import { IMAGE_BASE_URL } from '../../config/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Barang } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/Theme';

const BarangDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barang } = route.params;
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [imageError, setImageError] = React.useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Image
          source={{
            uri: !imageError && barang.foto?.startsWith('http')
              ? barang.foto
              : `${IMAGE_BASE_URL}${barang.foto || 'barang/default.png'}`,
          }}
          onError={() => setImageError(true)}
          style={styles.image}
        />
        <View style={styles.container}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{barang.kategori?.nama_kategori}</Text>
            </View>
            <View style={[styles.stockBadge, { backgroundColor: barang.stok > 0 ? '#DCFCE7' : '#FEE2E2' }]}>
              <Text style={[styles.stockText, { color: barang.stok > 0 ? '#166534' : '#991B1B' }]}>
                {barang.stok > 0 ? 'Tersedia' : 'Habis'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{barang.nama_barang}</Text>
          <Text style={styles.priceBig}>Rp {barang.harga_sewa.toLocaleString('id-ID')} / hari</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Deskripsi Peralatan</Text>
          <Text style={styles.description}>{barang.deskripsi || 'Tidak ada deskripsi.'}</Text>

          <View style={styles.specRow}>
            <View style={styles.specItem}>
              <Ionicons name="cube-outline" size={24} color={COLORS.primary} style={{ marginBottom: 6 }} />
              <Text style={styles.specLabel}>Sisa Stok</Text>
              <Text style={styles.specValue}>{barang.stok} unit</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="leaf-outline" size={24} color={COLORS.primary} style={{ marginBottom: 6 }} />
              <Text style={styles.specLabel}>Kondisi</Text>
              <Text style={styles.specValue}>Sangat Baik</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} style={{ marginBottom: 6 }} />
              <Text style={styles.specLabel}>Garansi</Text>
              <Text style={styles.specValue}>Kebersihan</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Booking Bar */}
      <View style={styles.stickyBar}>
        <View>
          <Text style={styles.stickyTotalLabel}>Harga Sewa</Text>
          <Text style={styles.stickyPrice}>Rp {barang.harga_sewa.toLocaleString('id-ID')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookingBtn, barang.stok === 0 && styles.bookingBtnDisabled]}
          disabled={barang.stok === 0}
          onPress={() => {
            if (!user) {
              navigation.navigate('Login');
              return;
            }
            addToCart(barang);
          }}>
          <Text style={styles.bookingBtnText}>Sewa Sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 380,
    resizeMode: 'cover',
    backgroundColor: '#fff',
  },
  container: {
    padding: 24,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -40,
    minHeight: 500,
    ...SHADOWS.medium,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  stockBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  stockText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  priceBig: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 26,
    marginBottom: 32,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: 20,
    ...SHADOWS.soft,
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  specLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  specValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 40,
    ...SHADOWS.medium,
  },
  stickyTotalLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  stickyPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bookingBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    elevation: 3,
  },
  bookingBtnDisabled: {
    backgroundColor: COLORS.border,
    elevation: 0,
  },
  bookingBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default BarangDetailScreen;


