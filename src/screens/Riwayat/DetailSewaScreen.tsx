import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import apiClient from '../../api/client';
import { ENDPOINTS, IMAGE_BASE_URL } from '../../config/api';
import { Sewa } from '../../types';
import { COLORS, RADIUS, SHADOWS } from '../../constants/Theme';

interface Props {
    navigation: any;
    route: {
        params: {
            sewa: Sewa;
        };
    };
}

const DetailSewaScreen: React.FC<Props> = ({ navigation, route }) => {
    const { sewa } = route.params;
    const [loading, setLoading] = useState(false);
    const [buktiImage, setBuktiImage] = useState<string | null>(null);

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            pending: COLORS.warning,
            dibayar: COLORS.success,
            dipinjam: COLORS.primary,
            dikembalikan: COLORS.textSecondary,
            batal: COLORS.error,
        };
        return colors[status] || COLORS.textSecondary;
    };

    const testEndpoint = async () => {
        try {
            console.log('Testing endpoint:', `${ENDPOINTS.SEWA}/${sewa.id}/upload-bukti`);
            const response = await apiClient.get(`${ENDPOINTS.SEWA}/${sewa.id}`);
            console.log('Sewa data:', response.data);
            Alert.alert('Test OK', 'Endpoint dapat diakses');
        } catch (error: any) {
            console.error('Test failed:', error);
            Alert.alert('Test Failed', error?.message || 'Tidak dapat mengakses endpoint');
        }
    };

    const handleUploadBukti = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1024,
            maxHeight: 1024,
        });

        if (result.didCancel) return;

        if (result.errorCode) {
            Alert.alert('Error', result.errorMessage || 'Gagal memilih foto');
            return;
        }

        if (result.assets && result.assets[0]) {
            const file = result.assets[0];

            try {
                setLoading(true);

                const formData = new FormData();
                formData.append('bukti_bayar', {
                    uri: file.uri,
                    type: file.type || 'image/jpeg',
                    name: file.fileName || 'bukti.jpg',
                } as any);

                const res = await apiClient.post(
                    `${ENDPOINTS.SEWA}/${sewa.id}/upload-bukti`,
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                );

                Alert.alert('Sukses', 'Bukti transfer berhasil diunggah', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
                setBuktiImage(file.uri);
            } catch (error: any) {
                console.error('Upload failed', error);
                const errorMessage = error?.response?.data?.message || error?.message || 'Gagal mengunggah bukti';
                Alert.alert('Gagal Upload', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detail Pesanan</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Order Info Card */}
                <View style={styles.card}>
                    <View style={styles.orderHeader}>
                        <Text style={styles.orderId}>TRX-{sewa.id}</Text>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(sewa.status) + '20' },
                            ]}>
                            <Text style={[styles.statusText, { color: getStatusColor(sewa.status) }]}>
                                {sewa.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.infoLabel}>Tanggal Sewa</Text>
                        <Text style={styles.infoValue}>{sewa.tanggal_sewa}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.infoLabel}>Tanggal Kembali</Text>
                        <Text style={styles.infoValue}>{sewa.tanggal_kembali}</Text>
                    </View>

                    {sewa.midtrans_order_id && (
                        <View style={styles.infoRow}>
                            <Ionicons name="card-outline" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.infoLabel}>Order ID</Text>
                            <Text style={[styles.infoValue, { fontSize: 11 }]}>{sewa.midtrans_order_id}</Text>
                        </View>
                    )}
                </View>

                {/* Items List */}
                <Text style={styles.sectionTitle}>Barang yang Disewa</Text>
                {sewa.detail_sewa?.map((detail, index) => (
                    <View key={index} style={styles.itemCard}>
                        <Image
                            source={{
                                uri: detail.barang?.foto?.startsWith('http')
                                    ? detail.barang.foto
                                    : `${IMAGE_BASE_URL}${detail.barang?.foto || 'barang/default.png'}`,
                            }}
                            style={styles.itemImage}
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.itemName}>{detail.barang?.nama_barang}</Text>
                            <Text style={styles.itemQty}>Qty: {detail.qty}</Text>
                            <Text style={styles.itemPrice}>
                                Rp {(detail.harga || 0).toLocaleString('id-ID')} / hari
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Price Breakdown */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Total Pembayaran</Text>
                        <Text style={styles.priceValue}>
                            Rp {sewa.total_harga.toLocaleString('id-ID')}
                        </Text>
                    </View>
                </View>

                {/* Notes */}
                {sewa.catatan && (
                    <View style={styles.noteBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Ionicons name="create-outline" size={16} color={COLORS.textSecondary} />
                            <Text style={[styles.sectionTitle, { marginLeft: 6, marginBottom: 0 }]}>Catatan</Text>
                        </View>
                        <Text style={styles.noteText}>{sewa.catatan}</Text>
                    </View>
                )}

                {/* Upload Bukti Section */}
                {(sewa.status === 'dibayar' || sewa.status === 'dipinjam' || sewa.status === 'dikembalikan') && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Bukti Pembayaran</Text>
                        {buktiImage || sewa.bukti_bayar ? (
                            <View>
                                <Image
                                    source={{ uri: buktiImage || `${IMAGE_BASE_URL}${sewa.bukti_bayar}` }}
                                    style={styles.buktiImage}
                                />
                                <Text style={styles.uploadedText}>✓ Bukti sudah diunggah</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadBtn}
                                onPress={handleUploadBukti}
                                disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color={COLORS.primary} />
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
                                        <Text style={styles.uploadBtnText}>Upload Bukti Transfer</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.soft,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: 20,
        marginBottom: 16,
        ...SHADOWS.soft,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderId: {
        fontWeight: 'bold',
        fontSize: 20,
        color: COLORS.textPrimary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.md,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoLabel: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    itemCard: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        marginBottom: 12,
        ...SHADOWS.soft,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.background,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    itemQty: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    priceValue: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 20,
    },
    noteBox: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: RADIUS.lg,
        marginBottom: 16,
        ...SHADOWS.soft,
    },
    noteText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        fontStyle: 'italic',
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: RADIUS.lg,
        borderStyle: 'dashed',
    },
    uploadBtnText: {
        marginLeft: 8,
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
    },
    buktiImage: {
        width: '100%',
        height: 200,
        borderRadius: RADIUS.md,
        marginBottom: 12,
        resizeMode: 'cover',
    },
    uploadedText: {
        textAlign: 'center',
        color: COLORS.success,
        fontWeight: '600',
    },
});

export default DetailSewaScreen;
