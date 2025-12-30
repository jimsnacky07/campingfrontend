import React from 'react';
import { ActivityIndicator, View } from 'react-native';
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
import MidtransPaymentScreen from '../screens/Pembayaran/MidtransPaymentScreen';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Tabs: undefined;
  BarangDetail: { barang: any };
  Keranjang: undefined;
  Checkout: undefined;
  Pembayaran: undefined;
  MidtransPayment: { redirect_url: string, order_id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Riwayat" component={RiwayatScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="BarangDetail" component={BarangDetailScreen} options={{ title: 'Detail Barang' }} />
    <Stack.Screen name="Keranjang" component={KeranjangScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="Pembayaran" component={PembayaranScreen} />
    <Stack.Screen name="MidtransPayment" component={MidtransPaymentScreen} options={{ title: 'Pembayaran Online' }} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;


