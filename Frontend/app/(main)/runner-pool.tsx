import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/useAuth';
import { listTasks, Task, updateTaskStatus, createTask } from '../../src/api/tasks';

export default function RunnerPoolScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<'service'|'delivery'>('service');
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async () => {
    try {
      const taskList = await listTasks(token!, { status: 'open', type: tab, limit: 50 });
      setTasks(taskList);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user && user.userType === 'entity') {
      Alert.alert('Access Denied', 'Only individual users can access the runner pool.');
      router.replace('/(main)');
      return;
    }
    loadTasks();
  }, [user, token, tab]);

  const acceptTask = async (t: Task) => {
    try {
      const updated = await updateTaskStatus(token!, t.id, 'assigned');
      setTasks(prev => prev.map(x => x.id === t.id ? updated : x));
    } catch (e) {
      Alert.alert('Error', 'Failed to accept task');
    }
  };

  const formatTimeAgo = (createdAt: string | number) => {
    const ts = typeof createdAt === 'number' ? createdAt : Date.parse(createdAt);
    const now = Date.now();
    const diff = now - ts;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.title}>Runner Pool</Text>
      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('service')} style={[styles.tabBtn, tab==='service' && styles.tabActive]}><Text style={[styles.tabText, tab==='service' && styles.tabTextActive]}>Service</Text></Pressable>
        <Pressable onPress={() => setTab('delivery')} style={[styles.tabBtn, tab==='delivery' && styles.tabActive]}><Text style={[styles.tabText, tab==='delivery' && styles.tabTextActive]}>Delivery</Text></Pressable>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No requests available</Text>
          <Text style={styles.emptySubtext}>Check back later or post a request!</Text>
        </View>
      ) : (
        tasks.map(task => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              {typeof task.budget !== 'undefined' && (
                <Text style={styles.budget}>${task.budget}</Text>
              )}
            </View>
            {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
            <View style={styles.taskFooter}>
              <Text style={styles.requester}>By: {task.requester || 'anonymous'}</Text>
              <Text style={styles.timeAgo}>{formatTimeAgo(task.createdAt)}</Text>
            </View>
            <View style={styles.actionsRow}>
              <View style={[styles.statusBadge, { backgroundColor: task.status === 'open' ? '#e8f5e8' : '#f0f0f0' }]}>
                <Text style={[styles.statusText, { color: task.status === 'open' ? '#2e7d32' : '#666' }]}>{String(task.status).toUpperCase()}</Text>
              </View>
              {task.status === 'open' && (
                <Pressable onPress={() => acceptTask(task)} style={styles.acceptBtn}>
                  <Text style={{ color:'#fff', fontWeight:'600' }}>Accept</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#888', textAlign: 'center' },
  taskCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  taskTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1, marginRight: 12 },
  budget: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32', backgroundColor: '#e8f5e8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  description: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  requester: { fontSize: 12, color: '#888' },
  timeAgo: { fontSize: 12, color: '#888' },
  actionsRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  acceptBtn: { backgroundColor:'#2e7d32', paddingHorizontal:12, paddingVertical:6, borderRadius:8 }
  ,tabs: { flexDirection:'row', marginBottom:12 }
  ,tabBtn: { flex:1, paddingVertical:8, backgroundColor:'#eee', marginRight:8, borderRadius:8, alignItems:'center' }
  ,tabActive: { backgroundColor:'#e3f2fd' }
  ,tabText: { color:'#666' }
  ,tabTextActive: { color:'#007AFF', fontWeight:'600' }
});
