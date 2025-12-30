import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { useCart } from '../../context/CartContext';

interface Props {
  navigation: any;
}

const KeranjangScreen: React.FC<Props> = ({ navigation }) => {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <FlatList
        data={items}
        keyExtractor={item => item.barang.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        refreshing={loading}
        onRefresh={refreshCart}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Keranjang masih kosong.</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.barang.nama_barang}</Text>
              <Text style={styles.price}>
                Rp {item.barang.harga_sewa.toLocaleString('id-ID')} / hari
              </Text>
            </View>
            <View style={styles.actionContainer}>
              {syncingId === item.barang.id ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <>
                  <TextInput
                    style={styles.qty}
                    keyboardType="number-pad"
                    value={String(item.qty)}
                    onChangeText={text => {
                      const qty = Math.max(1, Number(text) || 1);
                      handleUpdateQty(item.barang.id, qty);
                    }}
                  />
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
          <Text style={styles.total}>Total estimasi: Rp {totalPrice.toLocaleString('id-ID')}</Text>
          <PrimaryButton
            title="Lanjutkan"
            onPress={() => navigation.navigate('Checkout')}
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
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  name: {
    fontWeight: 'bold',
    color: '#111827',
  },
  price: {
    color: '#6B7280',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qty: {
    width: 60,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    color: '#111827',
  },
  delete: {
    color: '#DC2626',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
});

export default KeranjangScreen;


