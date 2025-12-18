import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Svg, { Path, Rect, Polyline } from 'react-native-svg';

const ACCENT = '#B30F1F';

const iconSize = 26;
const commonStroke = { strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const ShopIcon = ({ color }: { color: string }) => (
  <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
    <Path d="M6 10h12l-.9 9H6.9L6 10Z" stroke={color} {...commonStroke} />
    <Path d="M9 10V7.7a3 3 0 0 1 6 0V10" stroke={color} {...commonStroke} />
    <Rect x={6} y={9} width={12} height={2} rx={0.8} fill={color} />
  </Svg>
);

const SendIcon = ({ color }: { color: string }) => (
  <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 11.5 18.8 6c.8-.3 1.5.6 1.1 1.4l-2.7 4.6c-.13.22-.13.48 0 .7l2.7 4.6c.44.78-.28 1.7-1.1 1.4L4 12.5a.57.57 0 0 1 0-1Z"
      stroke={color}
      {...commonStroke}
    />
    <Path d="M11.5 12h4.2" stroke={color} {...commonStroke} />
  </Svg>
);

const ReceiveIcon = ({ color }: { color: string }) => (
  <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={5} width={16} height={14} rx={2.6} stroke={color} {...commonStroke} />
    <Path d="M12 8v6" stroke={color} {...commonStroke} />
    <Polyline points="9 11.5 12 14.5 15 11.5" fill="none" stroke={color} {...commonStroke} />
  </Svg>
);

const viewStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ececec',
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
  },
  webFixed: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
  },
  mobileFixed: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 8,
    height: 86,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 6,
    maxWidth: 480,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    gap: 4,
  },
});

const textStyles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: ACCENT,
    marginTop: 2,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  active: {
    color: ACCENT,
  },
});

export const BottomNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Shop', route: '/(main)/shopping', Icon: ShopIcon },
    { label: 'Send', route: '/(main)/pickup', Icon: SendIcon },
    { label: 'Receive', route: '/(main)/receive-deliveries', Icon: ReceiveIcon },
  ];

  return (
    <View style={[viewStyles.wrapper, Platform.OS === 'web' ? viewStyles.webFixed : viewStyles.mobileFixed]}>
      <View style={viewStyles.container}>
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.route);
          const color = ACCENT;
          return (
            <TouchableOpacity
              key={item.label}
              style={viewStyles.navItem}
              onPress={() => item.route && router.push(item.route as any)}
              activeOpacity={item.route ? 0.8 : 1}
            >
              <item.Icon color={color} />
              <Text style={[textStyles.label, isActive && textStyles.active]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
