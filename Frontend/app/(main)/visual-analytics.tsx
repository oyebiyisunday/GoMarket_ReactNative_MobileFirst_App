import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { API_BASE } from '../../src/lib/config';
import { router } from 'expo-router';

export default function VisualAnalyticsScreen() {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<'today' | '7d' | '30d'>('today');
  const { from, to } = useMemo(() => {
    const end = new Date();
    let start = new Date();
    if (range === '7d') start.setDate(end.getDate() - 6);
    if (range === '30d') start.setDate(end.getDate() - 29);
    if (range === 'today') start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    return { from: fmt(start), to: fmt(end) };
  }, [range]);
  const [topProducts, setTopProducts] = useState<Array<{ name: string; units: number }>>([]);

  const load = async () => {
    if (!token) return;
    try {
      const resp = await fetch(`${API_BASE}/business/summary?from=${from}&to=${to}`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setSummary(await resp.json());
      // Load products for performance list
      const pr = await fetch(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${token}` } });
      if (pr.ok) {
        const prods = await pr.json();
        const top = prods
          .map((p: any) => ({ name: p.name, units: p.totalSales || 0 }))
          .sort((a: any, b: any) => b.units - a.units)
          .slice(0, 5);
        setTopProducts(top);
      }
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
        <Text style={s.title}>Visual Analytics</Text>
        <View style={s.rangeRow}>
          {(['today','7d','30d'] as const).map(r => (
            <TouchableOpacity key={r} style={[s.rangeBtn, range === r && s.rangeBtnActive]} onPress={() => { setRange(r); load(); }}>
              <Text style={[s.rangeText, range === r && s.rangeTextActive]}>{r.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.exportBtn} onPress={() => exportCsv('analytics.csv', summary)}><Text style={s.exportText}>Export CSV</Text></TouchableOpacity>
        </View>
      </View>
      {!summary ? (
        <Text>Loading...</Text>
      ) : (
        <View style={s.grid}>
          <Tile label="Revenue" value={`$${(summary.revenue || 0).toFixed(2)}`} />
          <Tile label="Orders" value={String(summary.orders || 0)} />
          <Tile label="Units Sold" value={String(summary.units || 0)} />
          <Tile label="AOV" value={`$${(summary.aov || 0).toFixed(2)}`} />
          <Tile label="Low Stock" value={String(summary.lowStockItems || 0)} />
          <Tile label="Out of Stock" value={String(summary.outOfStockItems || 0)} />
        </View>
      )}

      {/* Top product performance - simple bars */}
      {topProducts.length > 0 && (
        <View style={{ backgroundColor:'#fff', marginTop:12, borderRadius:12, padding:16, elevation:2 }}>
          <Text style={{ fontWeight:'700', marginBottom:8, color:'#333' }}>Top Products (Units Sold)</Text>
          {topProducts.map((p, i) => (
            <BarRow key={i} label={p.name} value={p.units} max={Math.max(...topProducts.map(t=>t.units),1)} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.tile}>
      <Text style={s.tileValue}>{value}</Text>
      <Text style={s.tileLabel}>{label}</Text>
    </View>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const widthPct = Math.max(6, Math.round((value / (max||1)) * 100));
  return (
    <View style={{ marginVertical:6 }}>
      <Text numberOfLines={1} style={{ color:'#555', marginBottom:4 }}>{label}</Text>
      <View style={{ height:10, backgroundColor:'#f0f0f0', borderRadius:6, overflow:'hidden' }}>
        <View style={{ width:`${widthPct}%`, height:10, backgroundColor:'#007AFF' }} />
      </View>
      <Text style={{ fontSize:12, color:'#666', marginTop:2 }}>{value}</Text>
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
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#333' },
  rangeRow: { flexDirection: 'row', alignItems: 'center' },
  rangeBtn: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginRight: 8, backgroundColor: '#fff' },
  rangeBtnActive: { borderColor: '#007AFF', backgroundColor: '#e3f2fd' },
  rangeText: { color: '#444' },
  rangeTextActive: { color: '#007AFF', fontWeight: '600' },
  exportBtn: { marginLeft: 'auto', backgroundColor: '#2e7d32', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  exportText: { color: 'white', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { width: '48%', margin: '1%', backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 2, alignItems: 'center' },
  tileValue: { fontSize: 22, fontWeight: '700', color: '#333' },
  tileLabel: { fontSize: 12, color: '#666', marginTop: 6 }
});
