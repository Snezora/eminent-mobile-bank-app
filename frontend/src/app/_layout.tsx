import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/src/components/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthProvider, { useAuth } from "../providers/AuthProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAutoSignOut } from "../providers/useAutoSignOut";
import {
  AppState,
  AppStateStatus,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appState, setAppState] = useState<AppStateStatus>("active");
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
      if (nextAppState === "background" || nextAppState === "inactive") {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const [loaded, error] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
      {/* Blur overlay */}
      {isBlurred && (
        <BlurView intensity={70} style={StyleSheet.absoluteFill}>
          {/* Optional: Add a message or visual indicator */}
        </BlurView>
      )}
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isAdmin } = useAuth();

  return (
    <TouchableWithoutFeedback>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen
                name="index"
                options={{ headerShown: false, gestureEnabled: false }}
              />

              <Stack.Screen
                name="(user)"
                options={{ headerShown: false, gestureEnabled: false }}
              />
              <Stack.Screen
                name="(admin)"
                options={{ headerShown: false, gestureEnabled: false }}
              />
              <Stack.Screen name="(auth)" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </TouchableWithoutFeedback>
  );
}
