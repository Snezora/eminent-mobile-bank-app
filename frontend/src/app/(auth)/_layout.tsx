import { useAuth } from "@/src/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";

export default function authLayout() {
  const { session } = useAuth();

  // if (session) {
  //   return <Redirect href={"/"} />;
  // }

  return (
    <Stack>
      <Stack.Screen name="home-page" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="signup/sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}
