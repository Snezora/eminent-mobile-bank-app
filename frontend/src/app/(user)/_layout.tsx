import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Stack, Tabs } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/src/constants/Colors";
import { useColorScheme } from "@/src/components/useColorScheme";
import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function Layout() {
  return (
    <Stack>
      {/* Tabs as a screen in the Stack */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false, // Hide the header for the tabs
        }}
      />
      {/* Camera screen as a separate Stack screen */}
      <Stack.Screen
        name="camera"
        options={{
          title: "Camera",
          gestureEnabled: true, // Enable swipe back gesture
          headerShown: false, // Optional: Hide the header for the camera screen
        }}
      />
    </Stack>
  );
}
