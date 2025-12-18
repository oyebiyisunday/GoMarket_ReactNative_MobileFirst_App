import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { AppColors, AppSpacing } from '../../src/styles/AppStyles';

export default function DataPrivacy() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Data & Privacy</Text>
      <Text style={s.paragraph}>
        We collect only the data needed to fulfill your orders, payments, and delivery requests.
        This includes contact details, delivery addresses, and payment confirmations. We do not sell
        your data, and we use encrypted transport (HTTPS) for all requests.
      </Text>
      <Text style={s.subtitle}>What we store</Text>
      <Text style={s.paragraph}>
        - Account info (name, email, role){'\n'}
        - Orders and delivery requests (including pickup/drop-off details){'\n'}
        - Payment confirmations (no raw card data is stored){'\n'}
        - Optional chat/support messages
      </Text>
      <Text style={s.subtitle}>Your choices</Text>
      <Text style={s.paragraph}>
        - Update your profile and contact info in Settings{'\n'}
        - Request data export or deletion by contacting support{'\n'}
        - Opt out of marketing messages in Profile settings
      </Text>
      <Text style={s.subtitle}>Support</Text>
      <Text style={s.paragraph}>
        For any data/privacy questions, contact us via the Contact Us screen or support@example.com.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb' },
  content: { padding: AppSpacing.medium, paddingBottom: 40, gap: 10 },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  subtitle: { fontSize: 16, fontWeight: '700', color: '#222', marginTop: 12 },
  paragraph: { color: '#444', lineHeight: 20 },
});
