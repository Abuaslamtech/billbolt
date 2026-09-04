import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { COLORS } from '../theme';
import { submitWithFallback } from '../offlineQueue';

export default function AddProductScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [reorder, setReorder] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name || !cost || !price || !reorder) {
      Alert.alert('Missing info', 'Fill in name, cost price, selling price, and reorder level.');
      return;
    }
    setSaving(true);
    try {
      const result = await submitWithFallback(
        'submitProduct',
        { name, category, costPrice: Number(cost), sellingPrice: Number(price), reorderLevel: Number(reorder) },
        `Product: ${name}`
      );
      Alert.alert(
        result === 'synced' ? 'Product added' : 'Saved offline',
        result === 'synced' ? 'It\u2019s in your sheet.' : 'No connection right now \u2014 it\u2019ll sync automatically next time you\u2019re online.'
      );
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Something went wrong', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Product Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Oil Perfume (66k set)" />

      <Text style={styles.label}>Category (optional)</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Perfume" />

      <Text style={styles.label}>Cost Price (\u20a6)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={cost} onChangeText={setCost} placeholder="e.g. 6600" />

      <Text style={styles.label}>Selling Price (\u20a6)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} placeholder="e.g. 10900" />

      <Text style={styles.label}>Reorder Level</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={reorder} onChangeText={setReorder} placeholder="e.g. 15" />

      <TouchableOpacity style={[styles.button, saving && { opacity: 0.6 }]} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Add Product'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream, padding: 20 },
  label: { fontWeight: 'bold', color: COLORS.emeraldDark, marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: COLORS.white, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.lightGray },
  button: { backgroundColor: COLORS.gold, padding: 16, borderRadius: 10, marginTop: 28, marginBottom: 40 },
  buttonText: { color: COLORS.emeraldDark, textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});
