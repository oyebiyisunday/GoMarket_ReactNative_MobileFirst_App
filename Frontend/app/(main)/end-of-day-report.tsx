import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { API_BASE } from '../../src/lib/config';
import { router } from 'expo-router';

export default function EndOfDayReportScreen() {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryRows, setCategoryRows] = useState<Array<{ category: string; supply: number; stock: number }>>([]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const load = async () => {
    if (!token) return;
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/business/daily-summary/${today}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed');
      setData(await resp.json());
      // Load products and compute per-category supply/stock
      const pr = await fetch(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${token}` } });
      if (pr.ok) {
        const prods = await pr.json();
        const map: Record<string, { supply: number; stock: number }> = {};
        for (const p of prods) {
          const cat = p.category || 'Other';
          if (!map[cat]) map[cat] = { supply: 0, stock: 0 };
          map[cat].supply += (p.totalSupply || 0);
          map[cat].stock += (p.currentStock || 0);
        }
        setCategoryRows(Object.entries(map).map(([category, v]) => ({ category, supply: v.supply, stock: v.stock })));
      }
    } catch (e) {
      setError('Failed to load daily summary');
    } finally { setRefreshing(false); }
  };

  useEffect(() => {
    if (user && user.userType !== 'entity') {
      Alert.alert('Access Denied', 'Only business accounts can access this area.');
      router.replace('/');
      return;
    }
    load();
    const id = setInterval(load, 10000); // auto-update every 10s
    return () => clearInterval(id);
  }, [token, user]);

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <View style={s.header}>
        <Text style={s.title}>End of Day Report</Text>
        <TouchableOpacity style={s.exportBtn} onPress={() => exportCsv(`eod-${today}.csv`, data)}>
          <Text style={s.exportText}>Export CSV</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={s.error}>{error}</Text>}
      {!data ? (
        <Text>Loading...</Text>
      ) : (
        <View style={s.card}>
          <Row label="Transactions Today" value={String(data.totalSales || 0)} />
          <Row label="Revenue Today" value={`$${(data.totalRevenue || 0).toFixed(2)}`} />
          <Row label="Low Stock Items" value={String(data.lowStockItems || 0)} />
          <Row label="Out of Stock Items" value={String(data.outOfStockItems || 0)} />
          <Row label="Active Attendants" value={String(data.activeAttendants || 0)} />
        </View>
      )}

      {/* Category summary */}
      {categoryRows.length > 0 && (
        <View style={[s.card, { marginTop: 12 }]}> 
          <Text style={{ fontWeight:'700', marginBottom:8, color:'#333' }}>By Category</Text>
          <View style={{ flexDirection:'row', borderBottomWidth:1, borderBottomColor:'#eee', paddingBottom:6 }}>
            <Text style={[s.tableHeader,{flex:1.4}]}>Category</Text>
            <Text style={[s.tableHeader]}>Supply</Text>
            <Text style={[s.tableHeader]}>Total Stock</Text>
          </View>
          {categoryRows.map((r, idx) => (
            <View key={idx} style={{ flexDirection:'row', paddingVertical:6, borderBottomWidth:1, borderBottomColor:'#f6f6f6' }}>
              <Text style={[s.tableCell,{flex:1.4}]} numberOfLines={1}>{r.category}</Text>
              <Text style={s.tableCell}>{r.supply}</Text>
              <Text style={s.tableCell}>{r.stock}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

function exportCsv(filename: string, data: any) {
  try {
    const headers = Object.keys(data || {});
    const values = headers.map(h => JSON.stringify((data as any)[h] ?? ''));
    const csv = headers.join(',') + '\n' + values.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  } catch (err) {
    Alert.alert('Export not supported on this platform');
  }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  exportBtn: { marginLeft: 'auto', backgroundColor: '#2e7d32', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  exportText: { color: 'white', fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowLabel: { color: '#555' },
  rowValue: { fontWeight: '600', color: '#222' },
  error: { color: '#b00020', marginBottom: 8 }
  ,tableHeader: { flex:1, fontWeight:'700', color:'#555' }
  ,tableCell: { flex:1, color:'#333' }
});
