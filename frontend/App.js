import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';

import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

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

const MainStack = createStackNavigator();
const AuthStack = createStackNavigator();

function AuthNavigator({ onLoginSuccess, onRegisterSuccess }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {props => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {props => <RegisterScreen {...props} onRegisterSuccess={onRegisterSuccess} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function MainNavigator({ onLogout }) {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="Home">
        {props => <HomeScreen {...props} onLogout={onLogout} />}
      </MainStack.Screen>
      <MainStack.Screen name="Camera" component={CameraScreen} />
    </MainStack.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (token, user) => {
    setAuthToken(token);
    setUser(user);
    setIsLoggedIn(true);
  };
  const handleRegisterSuccess = (token, user) => {
    setAuthToken(token);
    setUser(user);
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <PaperProvider theme={customTheme}>
      <NavigationContainer theme={customTheme}>
        {isLoggedIn ? (
          <MainNavigator onLogout={handleLogout} />
        ) : (
          <AuthNavigator onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess} />
        )}
      </NavigationContainer>
    </PaperProvider>
  );
} 