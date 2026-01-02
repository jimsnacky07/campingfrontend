import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/Theme';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { ENDPOINTS, IMAGE_BASE_URL } from '../../config/api';
import { useCart } from '../../context/CartContext';
import { Barang, Kategori } from '../../types';

interface Props {
  navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [barang, setBarang] = useState<Barang[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart, items } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.qty, 0);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBarang();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedKategori]);

  const fetchKategori = async () => {
    try {
      const res = await apiClient.get<{ data: Kategori[] }>(ENDPOINTS.MASTER.KATEGORI);
      setKategori(res.data.data ?? res.data);
    } catch (error) {
      console.warn('Failed load kategori', error);
    }
  };

  const fetchBarang = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedKategori) params.kategori = selectedKategori;

      const res = await apiClient.get<{ data: Barang[] }>(ENDPOINTS.MASTER.BARANG, { params });
      setBarang(res.data.data ?? res.data);
    } catch (error) {
      console.warn('Failed load barang', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKategori();
    fetchBarang();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchKategori();
    fetchBarang();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedKategori(null);
  };

  const renderBarang = ({ item }: { item: Barang }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BarangDetail', { barang: item })}>
      <Image
        source={{
          uri: item.foto?.startsWith('http')
            ? item.foto
            : `${IMAGE_BASE_URL}${item.foto || 'barang/default.png'}`,
        }}
        style={styles.cardImage}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.cardTitle}>{item.nama_barang}</Text>
        <Text style={styles.cardSub}>{item.kategori?.nama_kategori}</Text>
        <Text style={styles.price}>Rp {item.harga_sewa.toLocaleString('id-ID')}</Text>
        <View style={styles.badgeContainer}>
          <View style={[styles.miniBadge, { backgroundColor: item.stok > 0 ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[styles.miniBadgeText, { color: item.stok > 0 ? '#166534' : '#991B1B' }]}>
              {item.stok > 0 ? 'Tersedia' : 'Habis'}
            </Text>
          </View>
          <Text style={styles.stockText}>Stok: {item.stok}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.addBtn, item.stok === 0 && styles.addBtnDisabled]}
        onPress={() => {
          if (!user) {
            navigation.navigate('Login');
            return;
          }
          if (item.stok > 0) addToCart(item);
        }}
        disabled={item.stok === 0}>
        <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.greetingText}>Halo, Petualang! 👋</Text>
          <Text style={styles.userName}>{user?.nama || 'Tamu'}</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Keranjang')}>
          <Ionicons name="bag-handle-outline" size={24} color={COLORS.primary} />
          {cartItemCount > 0 && (
            <View style={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: '#EF4444',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#fff'
            }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Banner Promo */}
      <View style={styles.promoBanner}>
        <View style={styles.promoTextContainer}>
          <Text style={styles.promoTitle}>Promo Liburan</Text>
          <Text style={styles.promoDesc}>Diskon 20% untuk paket Tenda + Porter!</Text>
          <TouchableOpacity style={styles.promoBtn}>
            <Text style={styles.promoBtnText}>Lihat Detail</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari peralatan..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kategori</Text>
      </View>
      <FlatList
        data={kategori}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.badge,
              selectedKategori === item.id && styles.badgeActive,
            ]}
            onPress={() => setSelectedKategori(prev => (prev === item.id ? null : item.id))}>
            <Text
              style={[
                styles.badgeText,
                selectedKategori === item.id && styles.badgeTextActive,
              ]}>
              {item.nama_kategori}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoryList}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Semua Peralatan</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={barang}
        keyExtractor={item => item.id.toString()}
        renderItem={renderBarang}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedKategori
                ? 'Tidak ada barang yang sesuai filter'
                : 'Barang belum tersedia'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContent: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  cartBtn: {
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  promoBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 24,
    height: 160,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  promoTextContainer: {
    width: '70%',
  },
  promoTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  promoDesc: {
    color: '#E5E7EB',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  promoBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    height: 52,
    ...SHADOWS.soft,
    marginBottom: 24,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  clearIcon: {
    fontSize: 18,
    color: COLORS.textSecondary,
    padding: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  categoryList: {
    paddingBottom: 16,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: '#fff',
    marginRight: 10,
    ...SHADOWS.soft,
    minWidth: 90,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: '#fff',
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    marginBottom: 16,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    resizeMode: 'cover',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  cardSub: {
    color: COLORS.textSecondary,
    marginVertical: 2,
    fontSize: 14,
  },
  price: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  stockText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

export default HomeScreen;
