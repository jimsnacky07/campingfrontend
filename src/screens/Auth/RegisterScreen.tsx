import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    alamat: '',
    telp: '',
    nik: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = async () => {
    setError(null);
    if (!form.nama || !form.email || !form.password) {
      setError('Lengkapi data wajib.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError('Konfirmasi password tidak sesuai.');
      return;
    }
    try {
      setLoading(true);
      await register(form);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Gagal registrasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Daftar</Text>
          <TextField label="Nama Lengkap" value={form.nama} onChangeText={text => onChange('nama', text)} />
          <TextField label="Username" value={form.username} onChangeText={text => onChange('username', text)} />
          <TextField
            label="Email"
            value={form.email}
            onChangeText={text => onChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField label="Telepon" value={form.telp} onChangeText={text => onChange('telp', text)} keyboardType="phone-pad" />
          <TextField label="NIK" value={form.nik} onChangeText={text => onChange('nik', text)} />
          <TextField label="Alamat" value={form.alamat} onChangeText={text => onChange('alamat', text)} multiline />
          <TextField
            label="Password"
            value={form.password}
            onChangeText={text => onChange('password', text)}
            secureTextEntry
          />
          <TextField
            label="Konfirmasi Password"
            value={form.password_confirmation}
            onChangeText={text => onChange('password_confirmation', text)}
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title="Daftar" onPress={onSubmit} loading={loading} />
          <View style={styles.redirect}>
            <Text>Sudah punya akun?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}> Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  error: {
    color: '#DC2626',
    marginBottom: 12,
  },
  redirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  link: {
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default RegisterScreen;


