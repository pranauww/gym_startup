import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider, Text, Button } from 'react-native-paper';

// Create a standalone theme object from scratch to avoid any import timing issues.
// This guarantees the object and its 'colors' property are always defined.
const customTheme = {
  dark: true,
  mode: 'adaptive',
  roundness: 12,
  colors: {
    primary: '#00FFD0',
    accent: '#FF00A8',
    background: '#18181A',
    surface: '#232326',
    text: '#FFFFFF',
    disabled: '#33334D',
    placeholder: '#A1A1AA',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF00A8',
    card: '#232326',
    border: '#232326',
    // Default required colors from react-native-paper
    onSurface: '#FFFFFF',
    primaryContainer: '#003e32',
    onPrimaryContainer: '#79ffdd',
    secondary: '#b3ccbf',
    onSecondary: '#1d352e',
    secondaryContainer: '#334b44',
    onSecondaryContainer: '#cfe8db',
    tertiary: '#a5cbe7',
    onTertiary: '#0a344a',
    tertiaryContainer: '#244b62',
    onTertiaryContainer: '#c2e7ff',
    error: '#ffb4ab',
    onError: '#690005',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',
    onBackground: '#e2e3e1',
    surfaceVariant: '#404944',
    onSurfaceVariant: '#c0c9c3',
    outline: '#8a938e',
    outlineVariant: '#404944',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#e2e3e1',
    inverseOnSurface: '#2e312f',
    inversePrimary: '#006b5a',
    elevation: {
      level0: 'transparent',
      level1: '#2e3733',
      level2: '#35413c',
      level3: '#3c4b44',
      level4: '#3f5049',
      level5: '#44574f',
    },
    surfaceDisabled: 'rgba(226, 227, 225, 0.12)',
    onSurfaceDisabled: 'rgba(226, 227, 225, 0.38)',
    backdrop: 'rgba(40, 42, 41, 0.4)',
  },
};

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
      <Button mode="contained" onPress={() => navigation.navigate('Camera')}>Go to Camera</Button>
    </View>
  );
}

function CameraScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Camera Screen</Text>
    </View>
  );
}

export default function App() {
  return (
    <PaperProvider theme={customTheme}>
      <NavigationContainer theme={customTheme}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Camera" component={CameraScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
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
  text: {
    color: '#FFFFFF',
    fontSize: 24,
  }
}); 