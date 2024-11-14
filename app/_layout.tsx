import { Stack } from "expo-router";
import { Platform } from "react-native";
import "../global.css";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  if (Platform.OS === 'web') {  
    return (
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
      </Stack>
    );
  } else {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
      </Stack>
    );
  }

}
