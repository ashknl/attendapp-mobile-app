import { Stack } from 'expo-router';

import { SessionProvider, useSession } from '@/context/ctx';
import { SplashScreenController } from '@/context/splash';
import { StatusBar } from 'expo-status-bar';

export default function Root() {
  // Set up the auth context and render your layout inside of it.
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}

// Create a new component that can access the SessionProvider context later.
function RootNavigator() {
  const { session } = useSession()
  return (
    <Stack>
      <StatusBar style="light" />
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="register" />
      </Stack.Protected>


    </Stack>


  )

}
