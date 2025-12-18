import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

type Props = {
  color?: string;
  size?: number;
  destination?: string; // target route when sending user "home"
  replace?: boolean; // optionally replace history to avoid stacking
};

export function HomeHeaderButton({
  color = '#222',
  size = 24,
  destination = '/(main)',
  replace = false,
}: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (replace && (router as any)?.replace) {
      router.replace(destination as any);
      return;
    }
    router.push(destination as any);
  };

  return (
    <Pressable onPress={handlePress} hitSlop={10} style={styles.container}>
      <Text style={[styles.label, { color, fontSize: size + 2, lineHeight: size + 4, fontWeight: '900' }]}>⌂</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  label: {
    fontWeight: '700',
  },
});
