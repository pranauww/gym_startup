import { DarkTheme as PaperDarkTheme } from 'react-native-paper';

export const customDarkTheme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    background: '#18181A',
    primary: '#00FFD0',
  },
}; 