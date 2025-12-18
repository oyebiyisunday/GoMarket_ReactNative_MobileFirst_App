import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/useAuth';
import { AppColors, AppSpacing } from '../../src/styles/AppStyles';

type MenuItem = { title: string; route: string };

const showAllMenus = process.env.EXPO_PUBLIC_SHOW_ALL_MENUS === 'true';

export default function MenuScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const baseItems: MenuItem[] = [
    { title: 'Profile', route: '/(main)/settings' },
    { title: 'Notifications', route: '/(main)/notifications' },
    { title: 'Contact us', route: '/(main)/support-chat' },
    { title: 'Data & Privacy', route: '/(main)/data-privacy' },
  ];

  const entityExtras: MenuItem[] = [
    { title: 'Store Console', route: '/(main)/store-console' },
    { title: 'Store Orders', route: '/(main)/store-orders' },
    { title: 'Product Management', route: '/(main)/product-management-table' },
    { title: 'End of Day Report', route: '/(main)/end-of-day-report' },
    { title: 'Visual Analytics', route: '/(main)/visual-analytics' },
  ];

  const driverExtras: MenuItem[] = [
    { title: 'Driver Orders', route: '/(main)/driver-orders' },
  ];

  const storeMenu = [...entityExtras, ...baseItems];

  const menuItems =
    showAllMenus
      ? [...entityExtras, ...driverExtras, ...baseItems]
      : user?.userType === 'driver'
      ? [...driverExtras, ...baseItems]
      : storeMenu;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Menu</Text>
      {menuItems.map((item) => (
        <TouchableOpacity key={item.title} style={styles.item} onPress={() => router.push(item.route as any)}>
          <Text style={styles.itemText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.item, styles.logout]} onPress={logout}>
        <Text style={[styles.itemText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.item, styles.close]} onPress={() => router.canGoBack() ? router.back() : router.push('/(main)' as any)}>
        <Text style={[styles.itemText, styles.closeText]}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: AppSpacing.large,
    backgroundColor: '#f6f7fb',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.secondary,
  },
  logout: {
    borderColor: '#d14',
    backgroundColor: '#fff5f6',
  },
  logoutText: {
    color: '#d14',
  },
  close: {
    borderColor: '#ccc',
  },
  closeText: {
    color: '#444',
  },
});
