import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { debug } from '../../utils/debug';

const MidtransPaymentScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { redirect_url, order_id } = route.params;

    debug.screen.mount('MidtransPaymentScreen');

    const onNavigationStateChange = (navState: any) => {
        debug.log('Midtrans WebView Navigation State Change', navState.url);

        // Check for success/finish keywords in Midtrans URL callback
        if (navState.url.includes('finish') || navState.url.includes('success')) {
            debug.info('Midtrans Payment Success detected in WebView', { order_id });
            navigation.navigate('Tabs', { screen: 'Riwayat' });
        }

        if (navState.url.includes('error') || navState.url.includes('failed')) {
            debug.error('Midtrans Payment Failed detected in WebView', { order_id });
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: redirect_url }}
                onNavigationStateChange={onNavigationStateChange}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
});

export default MidtransPaymentScreen;
