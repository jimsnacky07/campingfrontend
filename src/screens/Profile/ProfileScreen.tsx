import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user?.nama?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.nama ?? '-'}</Text>
        <Text style={styles.role}>{user?.role === 'admin' ? 'Administrator' : 'Pelanggan'}</Text>
      </View>

      {/* User Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informasi Akun</Text>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>📧</Text>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>👤</Text>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{user?.username || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>📱</Text>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Telepon</Text>
            <Text style={styles.value}>{user?.telp || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>📍</Text>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Alamat</Text>
            <Text style={styles.value}>{user?.alamat || '-'}</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.buttonContainer}>
        <PrimaryButton title="Logout" onPress={logout} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  icon: {
    fontSize: 24,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
});

export default ProfileScreen;
