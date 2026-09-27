import { OpenSwapButton } from '@/components/OpenSwapButton';
import { useColorScheme } from '@/ui/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const strings = {
  portfolio: 'Portfolio',
  swap: 'Swap',
};

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.root}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{ headerShown: false, title: strings.portfolio }}
            />
            <Stack.Screen name="swap" options={{ title: strings.swap }} />
            <Stack.Screen name="token/[networkId]/[address]" />
          </Stack>
          <OpenSwapButton />
        </View>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
