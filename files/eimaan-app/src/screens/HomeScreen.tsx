import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../theme';
import { getQueue, syncQueue } from '../offlineQueue';

export default function HomeScreen({ navigation }: any) {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getQueue().then((q) => setPending(q.length));
    }, [])
  );

  async function handleSync() {
    setSyncing(true);
    try {
      const { synced, failed } = await syncQueue();
      setPending(failed);
      Alert.alert('Sync complete', `${synced} synced, ${failed} still pending.`);
    } catch (e: any) {
      Alert.alert('Sync failed', e.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={syncing} onRefresh={handleSync} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Eimaan Maison</Text>
        <Text style={styles.subtitle}>Sales & Stock Tracker</Text>
      </View>

      {pending > 0 && (
        <TouchableOpacity style={styles.pendingBanner} onPress={handleSync} disabled={syncing}>
          <Text style={styles.pendingText}>
            {syncing ? 'Syncing…' : `${pending} entr${pending === 1 ? 'y' : 'ies'} waiting to sync — tap to retry`}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.card, { backgroundColor: COLORS.emerald }]} onPress={() => navigation.navigate('LogSale')}>
        <Text style={styles.cardTitle}>+ Log a Sale</Text>
        <Text style={styles.cardSub}>Record what you just sold</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, { backgroundColor: COLORS.emeraldLight }]} onPress={() => navigation.navigate('LogRestock')}>
        <Text style={styles.cardTitle}>Log a Restock</Text>
        <Text style={styles.cardSub}>Record stock coming in</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, { backgroundColor: COLORS.gold }]} onPress={() => navigation.navigate('AddProduct')}>
        <Text style={[styles.cardTitle, { color: COLORS.emeraldDark }]}>Add a Product</Text>
        <Text style={[styles.cardSub, { color: COLORS.emeraldDark }]}>New item to your catalog</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Pull down to sync, or tap the pending banner above. Full performance dashboards live in your Google Sheet.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream, padding: 20 },
  header: { marginBottom: 20, marginTop: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.emeraldDark },
  subtitle: { fontSize: 14, color: COLORS.gray, fontStyle: 'italic' },
  pendingBanner: { backgroundColor: COLORS.orange, padding: 12, borderRadius: 10, marginBottom: 16 },
  pendingText: { color: COLORS.white, fontWeight: 'bold', textAlign: 'center' },
  card: { padding: 20, borderRadius: 14, marginBottom: 14 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  cardSub: { fontSize: 13, color: COLORS.white, marginTop: 4, opacity: 0.9 },
  footerNote: { fontSize: 12, color: COLORS.gray, textAlign: 'center', marginTop: 20, marginBottom: 30 },
});
