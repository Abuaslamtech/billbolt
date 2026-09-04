import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from './src/theme';

import HomeScreen from './src/screens/HomeScreen';
import LogSaleScreen from './src/screens/LogSaleScreen';
import LogRestockScreen from './src/screens/LogRestockScreen';
import AddProductScreen from './src/screens/AddProductScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.emerald },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Eimaan Maison' }} />
        <Stack.Screen name="LogSale" component={LogSaleScreen} options={{ title: 'Log a Sale' }} />
        <Stack.Screen name="LogRestock" component={LogRestockScreen} options={{ title: 'Log a Restock' }} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Add a Product' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
