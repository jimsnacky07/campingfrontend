import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { COLORS, RADIUS, SHADOWS } from '../../constants/Theme';
import { IMAGE_BASE_URL } from '../../config/api';

interface Props {
    navigation: any;
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { user, setUser } = useAuth();
    const [form, setForm] = useState({
        nama: user?.nama || '',
        telp: user?.telp || user?.pelanggan?.telp || '',
        nik: user?.pelanggan?.nik || '',
        alamat: user?.alamat || user?.pelanggan?.alamat || '',
        password: '',
        password_confirmation: '',
    });
    const [foto, setFoto] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 500,
            maxHeight: 500,
        });

        if (result.assets && result.assets[0]) {
            setFoto(result.assets[0]);
        }
    };

    const handleUpdate = async () => {
        if (!form.nama) {
            Alert.alert('Error', 'Nama harus diisi');
            return;
        }

        if (form.password && form.password !== form.password_confirmation) {
            Alert.alert('Error', 'Konfirmasi password tidak sesuai');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('nama', form.nama);
            formData.append('telp', form.telp);
            formData.append('nik', form.nik);
            formData.append('alamat', form.alamat);
            if (form.password) formData.append('password', form.password);
            if (form.password_confirmation) formData.append('password_confirmation', form.password_confirmation);

            if (foto) {
                formData.append('foto', {
                    uri: foto.uri,
                    type: foto.type || 'image/jpeg',
                    name: foto.fileName || 'profile.jpg',
                } as any);
            }

            const res = await apiClient.post('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUser(res.data.user);
            setFoto(null); // Reset local selection to show the uploaded image
            Alert.alert('Sukses', 'Profil berhasil diperbarui', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Gagal', error?.response?.data?.message ?? 'Gagal memperbarui profil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: COLORS.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Edit Profil</Text>

                    <View style={styles.photoSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            {foto ? (
                                <Image source={{ uri: foto.uri }} style={styles.avatar} />
                            ) : user?.foto ? (
                                <Image source={{ uri: `${IMAGE_BASE_URL}${user.foto}` }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <Text style={styles.avatarInitials}>
                                        {user?.nama?.charAt(0).toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.editBadge}>
                                <Text style={{ fontSize: 12 }}>📷</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.photoLabel}>Ketuk untuk ganti foto</Text>
                    </View>

                    <TextField
                        label="Nama Lengkap"
                        value={form.nama}
                        onChangeText={(val) => setForm({ ...form, nama: val })}
                    />

                    <TextField
                        label="Nomor Telepon"
                        value={form.telp}
                        onChangeText={(val) => setForm({ ...form, telp: val })}
                        keyboardType="phone-pad"
                    />

                    <TextField
                        label="NIK"
                        value={form.nik}
                        onChangeText={(val) => setForm({ ...form, nik: val })}
                    />

                    <TextField
                        label="Alamat"
                        value={form.alamat}
                        onChangeText={(val) => setForm({ ...form, alamat: val })}
                        multiline
                    />

                    <View style={styles.divider} />
                    <Text style={styles.subtitle}>Ubah Password (Kosongkan jika tidak ingin diubah)</Text>

                    <TextField
                        label="Password Baru"
                        value={form.password}
                        onChangeText={(val) => setForm({ ...form, password: val })}
                        secureTextEntry
                    />

                    <TextField
                        label="Konfirmasi Password Baru"
                        value={form.password_confirmation}
                        onChangeText={(val) => setForm({ ...form, password_confirmation: val })}
                        secureTextEntry
                    />

                    <PrimaryButton
                        title="Simpan Perubahan"
                        onPress={handleUpdate}
                        loading={loading}
                        style={{ marginTop: 20 }}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: 24,
        ...SHADOWS.medium,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 20,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.background,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
    },
    avatarInitials: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.soft,
    },
    photoLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 8,
        fontWeight: '500',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 24,
    },
});

export default EditProfileScreen;
