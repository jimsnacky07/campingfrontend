import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../config/api';
import { useCart } from '../../context/CartContext';
import { Barang, Kategori } from '../../types';

interface Props {
  navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [barang, setBarang] = useState<Barang[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart } = useCart();

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
      
      // Build query params
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
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.nama_barang}</Text>
        <Text style={styles.cardSub}>{item.kategori?.nama_kategori}</Text>
        <Text style={styles.price}>Rp {item.harga_sewa.toLocaleString('id-ID')}/hari</Text>
        <Text style={styles.stock}>Stok: {item.stok}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.addBtn, item.stok === 0 && styles.addBtnDisabled]} 
        onPress={() => item.stok > 0 && addToCart(item)}
        disabled={item.stok === 0}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && !refreshing && barang.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Cari Peralatan Camping</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Keranjang')}>
          <Text style={styles.link}>Keranjang</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari barang..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {(searchQuery || selectedKategori) && (
          <TouchableOpacity style={styles.clearFilter} onPress={clearSearch}>
            <Text style={styles.clearFilterText}>Clear Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
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
                  onPress={() =>
                    setSelectedKategori(prev => (prev === item.id ? null : item.id))
                  }>
                  <Text
                    style={[
                      styles.badgeText,
                      selectedKategori === item.id && styles.badgeTextActive,
                    ]}>
                    {item.nama_kategori}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        }
        data={barang}
        keyExtractor={item => item.id.toString()}
        renderItem={renderBarang}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ padding: 20 }}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  link: {
    color: '#2563EB',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearIcon: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4,
  },
  clearFilter: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  clearFilterText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  badgeActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  badgeText: { color: '#111827' },
  badgeTextActive: { color: '#fff' },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
  },
  cardSub: {
    color: '#6B7280',
    marginVertical: 2,
    fontSize: 13,
  },
  price: {
    color: '#2563EB',
    fontWeight: 'bold',
    marginTop: 4,
  },
  stock: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#D1D5DB',
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
});

export default HomeScreen;
