import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/Theme';
import { IMAGE_BASE_URL } from '../../config/api';

const ProfileScreen: React.FC<any> = ({ navigation }) => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 20 }}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>👤</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 }}>
          Belum Masuk Akun
        </Text>
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginBottom: 30, lineHeight: 20 }}>
          Silakan masuk ke akun Anda untuk melihat profil, informasi penyewaan, dan mengelola akun.
        </Text>
        <PrimaryButton
          title="Login Sekarang"
          onPress={() => navigation.navigate('Login')}
          style={{ width: '100%' }}
        />
        <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.navigate('Register')}>
          <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Daftar Akun Baru</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Avatar Header */}
      <View style={styles.header}>
        <View style={styles.avatarGlow}>
          <View style={styles.avatarPlaceholder}>
            {user?.foto ? (
              <Image source={{ uri: `${IMAGE_BASE_URL}${user.foto}` }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.nama?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.name}>{user?.nama ?? '-'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'admin' ? 'Administrator' : 'Premium Member'}
          </Text>
        </View>
      </View>

      {/* User Info Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Detail Akun</Text>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>📧</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Email Terdaftar</Text>
            <Text style={styles.value}>{user?.email || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>👤</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{user?.username || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>📱</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <Text style={styles.value}>{user?.telp || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>🆔</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>NIK (Nomor Induk Kependudukan)</Text>
            <Text style={styles.value}>{user?.pelanggan?.nik || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>📍</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Alamat Pengiriman</Text>
            <Text style={styles.value}>{user?.alamat || '-'}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Edit Profil"
          onPress={() => navigation.navigate('EditProfile')}
          style={{ width: '100%', marginBottom: 12, backgroundColor: COLORS.secondary }}
        />
        <PrimaryButton
          title="Keluar Akun"
          onPress={logout}
          style={{ width: '100%', backgroundColor: COLORS.error, shadowColor: COLORS.error }}
        />
        <Text style={styles.versionText}>Versi 1.0.0 (Explorer Edition)</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarGlow: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: RADIUS.xl,
    padding: 24,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  value: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  buttonContainer: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    marginTop: 16,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default ProfileScreen;
