import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { API_BASE_URL } from '../config';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed');
      } else {
        setError('');
        setEmail('');
        setPassword('');
        onLoginSuccess(data.token, data.user);
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        mode="flat"
        textContentType="emailAddress"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="flat"
        textContentType="password"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="contained" style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#18181A" /> : 'Sign In'}
      </Button>
      <Button mode="outlined" style={styles.button} onPress={() => {}} icon="google">
        Sign In with Google
      </Button>
      <Text style={styles.switchText}>
        Don't have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>Register</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#00FFD0',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    letterSpacing: 1.5,
    textShadowColor: '#00FFD0',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  input: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#232326',
  },
  button: {
    width: '100%',
    marginVertical: 8,
    borderRadius: 12,
  },
  error: {
    color: '#FF00A8',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  switchText: {
    color: '#A1A1AA',
    marginTop: 24,
    fontSize: 16,
  },
  link: {
    color: '#00FFD0',
    textDecorationLine: 'underline',
  },
}); 