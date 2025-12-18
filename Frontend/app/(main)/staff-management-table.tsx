import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TextInput } from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { router } from 'expo-router';
import { API_BASE } from '../../src/lib/config';

type A = { id: string; employeeId: string; position: string; permissions: string; isActive: boolean; lastLogin?: string; user: { email: string; name?: string } };
type Activity = { attendantId: string; salesCount: number; salesAmount: number };

export default function StaffManagementTable() {
  const { user, token } = useAuth();
  const [attendants, setAttendants] = useState<A[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');

  const load = async () => {
    if (!token) return;
    const [att, act] = await Promise.all([
      fetch(`${API_BASE}/business/attendants`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/business/staff-activity?date=${new Date().toISOString().split('T')[0]}`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    if (att.ok) setAttendants(await att.json());
    if (act.ok) setActivity(await act.json());
    setRefreshing(false);
  };

  useEffect(() => {
    if (user && user.userType !== 'entity') { Alert.alert('Access Denied', 'Business only.'); router.replace('/'); return; }
    load();
  }, [token, user]);

  const map = useMemo(() => {
    const m: Record<string, Activity> = {};
    activity.forEach(a => { m[a.attendantId] = a; });
    return m;
  }, [activity]);

  const filtered = attendants.filter(a => !q || a.user.email.toLowerCase().includes(q.toLowerCase()) || (a.user.name||'').toLowerCase().includes(q.toLowerCase()) || a.employeeId.toLowerCase().includes(q.toLowerCase()));

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <View style={s.header}>
        <Text style={s.title}>Staff Management</Text>
        <TextInput style={[s.input,{flex:1,marginLeft:12}]} placeholder='Search...' value={q} onChangeText={setQ} />
      </View>

      <View style={s.table}>
        <Row header cells={[ 'Staff ID','Name','Role','Email','Active','Today Activity','Permissions','Last Login','Logout' ]} />
        {filtered.map(a => (
          <Row key={a.id} cells={[
            a.employeeId,
            a.user.name || '-',
            a.position,
            a.user.email,
            a.isActive ? 'Yes' : 'No',
            `${map[a.id]?.salesCount||0} • $${(map[a.id]?.salesAmount||0).toFixed(2)}`,
            summarizePerms(a.permissions),
            a.lastLogin ? new Date(a.lastLogin).toLocaleString() : '-',
            '-' // logout time not tracked in schema
          ]} />
        ))}
      </View>
    </ScrollView>
  );
}

function summarizePerms(json: string) {
  try { const obj = JSON.parse(json); const keys = Object.keys(obj).filter(k => obj[k]); return keys.slice(0,3).join(', ') + (keys.length>3?'…':''); } catch (err) { return '-'; }
}

function Row({ header, cells }: { header?: boolean; cells: string[] }) {
  return (
    <View style={[s.row, header && s.rowHeader]}>
      {cells.map((c, i) => (
        <Text key={i} numberOfLines={1} style={[s.cell, header && s.cellHeader, (i===0?{flex:1.1}:{}) as any, (i===1?{flex:1.4}:{}) as any]}>{c}</Text>
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
  cellHeader: { fontWeight:'700', color:'#555' }
});
