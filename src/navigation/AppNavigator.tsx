import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import BarangDetailScreen from '../screens/Home/BarangDetailScreen';
import KeranjangScreen from '../screens/Sewa/KeranjangScreen';
import CheckoutScreen from '../screens/Sewa/CheckoutScreen';
import PembayaranScreen from '../screens/Pembayaran/PembayaranScreen';
import RiwayatScreen from '../screens/Riwayat/RiwayatScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import MidtransPaymentScreen from '../screens/Pembayaran/MidtransPaymentScreen';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Tabs: undefined;
  BarangDetail: { barang: any };
  Keranjang: undefined;
  Checkout: undefined;
  Pembayaran: undefined;
  MidtransPayment: { redirect_url: string, order_id: string };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

import { COLORS, RADIUS, SHADOWS } from '../constants/Theme';

const TabNavigator = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: RADIUS.full,
          backgroundColor: COLORS.surface,
          paddingBottom: 0,
          ...SHADOWS.medium,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
          fontSize: 10,
          marginBottom: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let icon = '';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Riwayat') icon = '📜';
          else if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: 24, color }}>{icon}</Text>;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Riwayat" component={RiwayatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {/* Main App Flow - Always accessible */}
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="BarangDetail"
          component={BarangDetailScreen}
          options={{ headerShown: true, title: 'Detail Barang' }}
        />
        <Stack.Screen name="Keranjang" component={KeranjangScreen} options={{ headerShown: true }} />

        {/* Auth Screens - Only accessible if not logged in */}
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            {/* Authenticated Only Screens */}
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Pembayaran" component={PembayaranScreen} options={{ headerShown: true }} />
            <Stack.Screen
              name="MidtransPayment"
              component={MidtransPaymentScreen}
              options={{ headerShown: true, title: 'Pembayaran Online' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: true, title: 'Edit Profil' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;


