import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { API_BASE } from '../../src/lib/config';

type CareWord = {
  id: string;
  term: string;
  isActive: boolean;
};

type Match = {
  careWordId: string;
  term: string;
  source: string;
  itemId: string;
  name: string;
  description?: string;
  storeId?: string;
};

export default function NotificationsScreen() {
  const { token } = useAuth();
  const [careWordInput, setCareWordInput] = useState('');
  const [careWords, setCareWords] = useState<CareWord[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : undefined;

  const loadCareWords = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/carewords`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setCareWords(json.items || []);
    } catch (error) {
      console.error('carewords load failed', error);
    }
  };

  const loadMatches = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/carewords/matches`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setMatches(json.matches || []);
    } catch (error) {
      console.error('careword matches failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCareWords();
    loadMatches();
  }, [token]);

  const addCareWord = async () => {
    const term = careWordInput.trim();
    if (!term) return;
    try {
      const res = await fetch(`${API_BASE}/carewords`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ term }),
      });
      if (!res.ok) throw new Error('Failed to save care word');
      setCareWordInput('');
      await loadCareWords();
      await loadMatches();
    } catch (error: any) {
      Alert.alert('Unable to save', error?.message || 'Please try again.');
    }
  };

  const deleteCareWord = async (id: string) => {
    try {
      await fetch(`${API_BASE}/carewords/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCareWords((prev) => prev.filter((cw) => cw.id !== id));
      setMatches((prev) => prev.filter((m) => m.careWordId !== id));
    } catch (error) {
      console.error('delete careword failed', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>
        Create a <Text style={styles.bold}>care word</Text> for the items you’re looking for. When a store posts something that matches, it will appear below.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Create care word</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. baby formula, cold pack..."
          value={careWordInput}
          onChangeText={setCareWordInput}
        />
        <TouchableOpacity style={styles.addButton} onPress={addCareWord}>
          <Text style={styles.addButtonText}>Save care word</Text>
        </TouchableOpacity>
        {careWords.length > 0 ? (
          <View style={styles.careWordList}>
            {careWords.map((cw) => (
              <View key={cw.id} style={styles.careWordChip}>
                <Text style={styles.careWordText}>{cw.term}</Text>
                <TouchableOpacity onPress={() => deleteCareWord(cw.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No care words yet. Add your first keyword above.</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.matchesHeader}>
          <Text style={styles.sectionHeader}>Matches</Text>
          <TouchableOpacity onPress={loadMatches}>
            <Text style={styles.refreshLink}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator />
        ) : matches.length === 0 ? (
          <Text style={styles.emptyText}>Nothing matches your care words yet.</Text>
        ) : (
          matches.map((match, idx) => (
            <View key={`${match.careWordId}-${match.itemId}-${idx}`} style={styles.matchCard}>
              <Text style={styles.matchTitle}>{match.name}</Text>
              {match.description ? <Text style={styles.matchDescription}>{match.description}</Text> : null}
              <View style={styles.matchMetaRow}>
                <Text style={styles.matchMeta}>Care word: {match.term}</Text>
                <Text style={styles.matchMeta}>Store ID: {match.storeId || 'n/a'}</Text>
                <Text style={styles.matchMeta}>Source: {match.source}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 60,
    backgroundColor: "#fff6f8",
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2a050d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#7c4b54',
    marginBottom: 20,
  },
  bold: {
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0d1d8',
    padding: 18,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2a050d',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#f0d1d8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#B30F1F',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  careWordList: {
    gap: 10,
  },
  careWordChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff6f8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  careWordText: {
    fontWeight: '600',
    color: '#2a050d',
    textTransform: 'capitalize',
  },
  removeText: {
    color: '#B30F1F',
    fontWeight: '600',
  },
  emptyText: {
    color: '#7c4b54',
  },
  matchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshLink: {
    color: '#B30F1F',
    fontWeight: '600',
  },
  matchCard: {
    borderWidth: 1,
    borderColor: '#f3dbe0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff9fb',
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2a050d',
  },
  matchDescription: {
    marginTop: 4,
    color: '#6c5a5f',
  },
  matchMetaRow: {
    marginTop: 8,
    gap: 4,
  },
  matchMeta: {
    fontSize: 12,
    color: '#7c4b54',
  },
});
