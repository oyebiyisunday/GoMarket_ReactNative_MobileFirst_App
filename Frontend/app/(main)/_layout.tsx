import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../src/auth/useAuth';
import { Pressable, ActivityIndicator, View, Text } from 'react-native';
import { AppColors } from '../../src/styles/AppStyles';
import { HomeHeaderButton } from '../../src/components/HomeHeaderButton';

export default function MainLayout() {
  const { token, loading, logout, user } = useAuth();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const entityMenuItems = [
    { title: 'Notifications', route: '/(main)/notifications' },
    { title: 'Store Console', route: '/(main)/store-console' },
    { title: 'Product Management', route: '/(main)/product-management-table' },
    { title: 'End of Day Report', route: '/(main)/end-of-day-report' },
    { title: 'Visual Analytics', route: '/(main)/visual-analytics' },
    { title: 'Profile', route: '/(main)/settings' },
    { title: 'Chat with us', route: '/(main)/support-chat' },
  ];

  const accentColor = AppColors.secondary;
  const consumerMenuItems = [
    { title: 'Notifications', route: '/(main)/notifications' },
    { title: 'Profile', route: '/(main)/settings' },
    { title: 'Chat with us', route: '/(main)/support-chat' },
  ];

  const menuItems = user?.userType === 'entity' ? entityMenuItems : consumerMenuItems;

  const navigateToRoute = (route: string) => {
    router.push(route as any);
  };

  const HeaderNavButtons = () => {
    const canGoBack = router.canGoBack();
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => { if (canGoBack) router.back(); }}
          hitSlop={10}
          disabled={!canGoBack}
          style={{ paddingHorizontal: 8, opacity: canGoBack ? 1 : 0.5 }}
        >
          <Text style={{ fontWeight: '900', color: '#222', fontSize: 22, lineHeight: 24 }}>←</Text>
        </Pressable>
        <HomeHeaderButton destination="/(main)" />
      </View>
    );
  };

  useEffect(() => {
    if (!navigationState?.key) return;
    if (!loading && !token) {
      router.replace('/(auth)/login');
    }
  }, [loading, navigationState?.key, token, router]);

  if (!navigationState?.key || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerBackVisible: false,
          headerLeft: () => <HeaderNavButtons />,
          headerRight: () => (
            <Pressable
              onPress={() => navigateToRoute('/(main)/menu')}
              hitSlop={10}
              style={{ paddingHorizontal: 12 }}
            >
              <Text style={{ fontWeight: '700', color: '#222' }}>Menu</Text>
            </Pressable>
          ),
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="shopping" options={{ title: 'Shopping' }} />
        <Stack.Screen name="store-catalog" options={{ title: 'Store Catalog' }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
        <Stack.Screen name="card-payment" options={{ title: 'Card Payment' }} />
        <Stack.Screen name="pickup" options={{ title: 'Delivery Request' }} />
        {/* Sell page removed */}
        <Stack.Screen name="runner-pool" options={{ title: 'Runner Pool' }} />
        <Stack.Screen name="support-chat" options={{ title: 'Chat with Us' }} />
        <Stack.Screen name="my-orders" options={{ title: 'My Orders' }} />
        <Stack.Screen name="order-details" options={{ title: 'Order Details' }} />
        <Stack.Screen name="location-mapper" options={{ title: 'Map My Location' }} />
        <Stack.Screen name="product-management-table" options={{ title: 'Product Management' }} />
        <Stack.Screen name="create-product" options={{ title: 'Create Product' }} />
        <Stack.Screen name="end-of-day-report" options={{ title: 'End of Day Report' }} />
        <Stack.Screen name="visual-analytics" options={{ title: 'Visual Analytics' }} />
        <Stack.Screen name="approvals" options={{ title: 'Approvals' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="settings" options={{ title: 'Profile' }} />
        <Stack.Screen name="store-console" options={{ title: 'Store Console' }} />
        <Stack.Screen name="menu" options={{ title: 'Menu' }} />
        <Stack.Screen name="store-orders" options={{ title: 'Store Orders' }} />
        <Stack.Screen name="driver-orders" options={{ title: 'Driver Orders' }} />
        <Stack.Screen name="receive-deliveries" options={{ title: 'Receive Deliveries' }} />
        <Stack.Screen name="data-privacy" options={{ title: 'Data & Privacy' }} />
      </Stack>
    </>
  );
}
