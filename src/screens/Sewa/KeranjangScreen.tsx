import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/Theme';
import EmptyState from '../../components/EmptyState';

const KeranjangScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { items, updateQty, remove, totalPrice, loading, refreshCart } = useCart();
  const [syncingId, setSyncingId] = React.useState<number | null>(null);

  const handleUpdateQty = async (id: number, qty: number) => {
    setSyncingId(id);
    await updateQty(id, qty);
    setSyncingId(null);
  };

  const handleRemove = async (id: number) => {
    setSyncingId(id);
    await remove(id);
    setSyncingId(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <FlatList
        data={items}
        keyExtractor={item => item.barang.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        refreshing={loading}
        onRefresh={refreshCart}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="🛒"
              title="Keranjang Kosong"
              message="Belum ada alat camping yang kamu pilih."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.barang.nama_barang}</Text>
              <Text style={styles.category}>{item.barang.kategori?.nama_kategori}</Text>
              <Text style={styles.price}>
                Rp {item.barang.harga_sewa.toLocaleString('id-ID')} / hari
              </Text>
            </View>
            <View style={styles.actionContainer}>
              {syncingId === item.barang.id ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => item.qty > 1 && handleUpdateQty(item.barang.id, item.qty - 1)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQty(item.barang.id, item.qty + 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item.barang.id)}>
                    <Text style={styles.delete}>Hapus</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      />
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimasi</Text>
            <Text style={styles.totalPrice}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
          </View>
          <PrimaryButton
            title="Lanjutkan ke Checkout"
            onPress={() => {
              if (!user) {
                navigation.navigate('Login');
                return;
              }
              navigation.navigate('Checkout');
            }}
            disabled={loading || syncingId !== null}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginBottom: 16,
    ...SHADOWS.soft,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  category: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  price: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionContainer: {
    alignItems: 'flex-end',
    gap: 10,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  qtyText: {
    width: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  delete: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 12,
  },
  footer: {
    padding: 24,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...SHADOWS.medium,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default KeranjangScreen;


