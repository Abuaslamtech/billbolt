import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../theme';
import { fetchProducts } from '../api';
import { submitWithFallback } from '../offlineQueue';

export default function LogRestockScreen({ navigation }: any) {
  const [products, setProducts] = useState<string[]>([]);
  const [product, setProduct] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then((list) => {
        setProducts(list);
        if (list.length) setProduct(list[0]);
      })
      .catch((e) => Alert.alert('Could not load products', e.message));
  }, []);

  async function handleSubmit() {
    if (!product || !qty || !cost) {
      Alert.alert('Missing info', 'Fill in product, quantity, and cost per unit.');
      return;
    }
    setSaving(true);
    try {
      const result = await submitWithFallback(
        'submitRestock',
        { date: date.toISOString().split('T')[0], product, qty: Number(qty), costPerUnit: Number(cost) },
        `Restock: ${product} x${qty}`
      );
      Alert.alert(
        result === 'synced' ? 'Restock logged' : 'Saved offline',
        result === 'synced' ? 'It\u2019s in your sheet.' : 'No connection right now \u2014 it\u2019ll sync automatically next time you\u2019re online.'
      );
      setQty('');
      setCost('');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Something went wrong', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(_, d) => {
            setShowPicker(false);
            if (d) setDate(d);
          }}
        />
      )}

      <Text style={styles.label}>Product</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={product} onValueChange={setProduct}>
          {products.map((p) => (
            <Picker.Item key={p} label={p} value={p} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Qty Restocked</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={qty} onChangeText={setQty} placeholder="e.g. 10" />

      <Text style={styles.label}>Cost per Unit (\u20a6)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={cost} onChangeText={setCost} placeholder="e.g. 6600" />

      <TouchableOpacity style={[styles.button, saving && { opacity: 0.6 }]} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Log Restock'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream, padding: 20 },
  label: { fontWeight: 'bold', color: COLORS.emeraldDark, marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: COLORS.white, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.lightGray },
  pickerWrap: { backgroundColor: COLORS.white, borderRadius: 8, borderWidth: 1, borderColor: COLORS.lightGray },
  button: { backgroundColor: COLORS.emeraldLight, padding: 16, borderRadius: 10, marginTop: 28, marginBottom: 40 },
  buttonText: { color: COLORS.white, textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});
