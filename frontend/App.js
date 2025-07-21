import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from './config';

function HomeScreen({ navigation }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then(res => res.json())
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Home Screen</Text>
      <Button title="Go to Camera" onPress={() => navigation.navigate('Camera')} />
      <View style={{ marginTop: 30 }}>
        <Text style={{ fontWeight: 'bold' }}>Backend Health Check:</Text>
        {loading && <ActivityIndicator size="small" />}
        {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
        {health && (
          <Text style={{ color: 'green' }}>Status: {health.status} ({health.environment}){"\n"}Time: {health.timestamp}</Text>
        )}
      </View>
    </View>
  );
}

function CameraScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Camera Screen (to be implemented)</Text>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 