import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { API_BASE } from '../../src/lib/config';
import { router } from 'expo-router';

type P = { id: string; productId: string; name: string; category?: string; openingStock?: number; totalSupply?: number; currentStock: number; totalSales: number; price: number; minStockLevel: number };

export default function ProductManagementTable() {
  const { user, token } = useAuth();
  const [items, setItems] = useState<P[]>([]);
  const [daily, setDaily] = useState<Record<string, { soldToday: number; supplyToday: number; totalToday: number }>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [supplyOpen, setSupplyOpen] = useState<null | P>(null);
  const [supplyQty, setSupplyQty] = useState('');
  const [supplyUnitCost, setSupplyUnitCost] = useState('');
  const [supplyImageUrl, setSupplyImageUrl] = useState('');

  const load = async () => {
    if (!token) return;
    try {
    const resp = await fetch(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) setItems(await resp.json()); else Alert.alert('Error', 'Failed to load products');
      const today = new Date().toISOString().split('T')[0];
      const dresp = await fetch(`${API_BASE}/products/daily-stats?date=${today}`, { headers: { Authorization: `Bearer ${token}` } });
      if (dresp.ok) {
        const rows = await dresp.json();
        const map: Record<string, any> = {};
        rows.forEach((r: any) => { map[r.id] = { soldToday: r.soldToday, supplyToday: r.supplyToday, totalToday: r.totalToday }; });
        setDaily(map as any);
      }
    } finally { setRefreshing(false); }
  };

  useEffect(() => {
    if (user && user.userType !== 'entity') { Alert.alert('Access Denied', 'Business only.'); router.replace('/'); return; }
    load();
  }, [token, user]);

  const filtered = items.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.productId.toLowerCase().includes(q.toLowerCase()));

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <View style={s.header}>
        <Text style={s.title}>Product Management</Text>
        <TextInput style={[s.input,{flex:1,marginLeft:12}]} placeholder='Search...' value={q} onChangeText={setQ} />
      </View>

      <View style={s.table}>
        <Row header cells={[ 'Product ID','Product Name','Open','Supply(Today)','Total(Today)','Stock(Avail)','Sold(Today)','Unit $','Sold $','Min Alert','' ]} />
        {filtered.map(p => (
          <View key={p.id}>
            <Row cells={[
              p.productId,
              p.name,
              String((p as any).openingStock ?? '-'),
              String((daily[p.id]?.supplyToday ?? 0)),
              String((daily[p.id]?.totalToday ?? (p.currentStock + 0))),
              String(p.currentStock) + (p.currentStock <= p.minStockLevel ? ' !' : ''),
              String(daily[p.id]?.soldToday ?? 0),
              `$${p.price.toFixed(2)}`,
              `$${(((daily[p.id]?.soldToday ?? 0) * p.price).toFixed(2))}`,
              String(p.minStockLevel),
              'Supply+'
            ]} />
            <View style={s.actionsRow}>
              <TouchableOpacity style={s.supplyBtn} onPress={() => { setSupplyOpen(p); setSupplyQty(''); setSupplyUnitCost(''); setSupplyImageUrl(''); }}>
                <Text style={s.supplyBtnText}>Add Supply</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Supply modal */}
      <Modal visible={!!supplyOpen} animationType='slide' transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Add Supply {supplyOpen?.name ? `- ${supplyOpen?.name}` : ''}</Text>
            <TextInput style={s.input} placeholder='Quantity (e.g., 10)' keyboardType='numeric' value={supplyQty} onChangeText={setSupplyQty} />
            <TextInput style={s.input} placeholder='Unit Cost (optional)' keyboardType='numeric' value={supplyUnitCost} onChangeText={setSupplyUnitCost} />
            <TextInput style={s.input} placeholder='Image URL (optional)' value={supplyImageUrl} onChangeText={setSupplyImageUrl} />
            <View style={{ flexDirection:'row', gap:12, marginTop:12 }}>
              <TouchableOpacity style={[s.modalBtn,{ backgroundColor:'#6c757d' }]} onPress={() => setSupplyOpen(null)}>
                <Text style={s.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn,{ backgroundColor:'#2e7d32' }]} onPress={async () => {
                try {
                  if (!token || !supplyOpen) return;
                  const body: any = { quantity: parseInt(supplyQty) };
                  if (supplyUnitCost) body.unitCost = parseFloat(supplyUnitCost);
                  if (supplyImageUrl) body.imageUrl = supplyImageUrl;
                  const resp = await fetch(`${API_BASE}/products/${supplyOpen.id}/supply`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                  });
                  if (!resp.ok) { const e = await resp.json(); throw new Error(e.error || 'Failed'); }
                  setSupplyOpen(null); load();
                } catch (e:any) { Alert.alert('Error', e.message||'Failed to add supply'); }
              }}>
                <Text style={s.modalBtnText}>Save Supply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Row({ header, cells }: { header?: boolean; cells: string[] }) {
  return (
    <View style={[s.row, header && s.rowHeader]}>
      {cells.map((c, i) => (
        <Text key={i} numberOfLines={1} style={[s.cell, header && s.cellHeader, (i===0?{flex:1.1}:{}) as any, (i===1?{flex:1.6}:{}) as any]}>{c}</Text>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection:'row', alignItems:'center', padding:16 },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, backgroundColor:'#fff' },
  table: { backgroundColor: '#fff', margin:16, borderRadius:12, overflow:'hidden', elevation:2 },
  row: { flexDirection:'row', borderBottomWidth:1, borderBottomColor:'#f0f0f0', paddingVertical:10, paddingHorizontal:8 },
  rowHeader: { backgroundColor:'#f8f9fa' },
  cell: { flex:1, fontSize:12, color:'#333' },
  cellHeader: { fontWeight:'700', color:'#555' },
  actionsRow: { paddingHorizontal:8, paddingVertical:6, alignItems:'flex-end' },
  supplyBtn: { backgroundColor:'#007AFF', paddingHorizontal:12, paddingVertical:6, borderRadius:8 },
  supplyBtnText: { color:'#fff', fontWeight:'600' },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  modalCard: { backgroundColor:'#fff', width:'85%', borderRadius:12, padding:16 },
  modalTitle: { fontSize:18, fontWeight:'700', color:'#333', marginBottom:8 },
  modalBtn: { flex:1, paddingVertical:10, borderRadius:8, alignItems:'center' },
  modalBtnText: { color:'#fff', fontWeight:'600' }
});
