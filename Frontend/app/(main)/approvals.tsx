import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { API_BASE } from '../../src/lib/config';
import { router } from 'expo-router';

type PendingUser = { id: string; email: string; name?: string; userType: string; phone?: string; idNumber?: string; createdAt: string };

export default function ApprovalsScreen() {
  const { user, token } = useAuth();
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!token) return;
    const resp = await fetch(`${API_BASE}/business/approvals/pending`, { headers: { Authorization: `Bearer ${token}` } });
    if (resp.ok) setPending(await resp.json());
    setRefreshing(false);
  };

  const approve = async (id: string) => {
    if (!token) return;
    const resp = await fetch(`${API_BASE}/business/approvals/${id}/approve`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    if (resp.ok) { Alert.alert('Approved', 'User has been approved.'); load(); } else { Alert.alert('Error', 'Failed to approve user'); }
  };

  useEffect(() => {
    if (user && user.userType !== 'entity') {
      Alert.alert('Access Denied', 'Only business accounts can access this area.');
      router.replace('/');
      return;
    }
    load();
  }, [token, user]);

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <Text style={s.title}>Pending Approvals</Text>
      {pending.length === 0 ? (
        <Text style={s.empty}>No pending applications.</Text>
      ) : (
        pending.map(p => (
          <View key={p.id} style={s.card}>
            <Text style={s.primary}>{p.name || p.email}</Text>
            <Text style={s.secondary}>{p.email} • {p.userType}</Text>
            <Text style={s.secondary}>Phone: {p.phone || '-'} • ID: {p.idNumber || '-'}</Text>
            <TouchableOpacity style={s.btn} onPress={() => approve(p.id)}>
              <Text style={s.btnText}>Approve</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#333' },
  empty: { color: '#666' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  primary: { fontSize: 16, fontWeight: '600', color: '#333' },
  secondary: { color: '#666', marginTop: 2 },
  btn: { marginTop: 10, backgroundColor: '#2e7d32', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '600' }
});
