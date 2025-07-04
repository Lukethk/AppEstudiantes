import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { NotificationProvider } from '../context/NotificationContext';
import { SessionProvider } from '../context/SessionContext';
import { THEME_STORAGE_KEY, ThemeContext } from '../context/ThemeContext';

export default function RootLayout() {
  const [isDark, setIsDark] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Cargar el tema guardado al iniciar la app
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Error al cargar el tema:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error al guardar el tema:', error);
    }
  };

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <SessionProvider>
        <NotificationProvider>
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="nueva-solicitud" />
              <Stack.Screen name="solicitud/[id]" />
              <Stack.Screen name="notificaciones" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </ThemeProvider>
        </NotificationProvider>
      </SessionProvider>
    </ThemeContext.Provider>
  );
}
