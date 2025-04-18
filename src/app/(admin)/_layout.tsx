import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Stack, Tabs } from "expo-router";
import { Modal, Pressable } from "react-native";

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

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    // <Tabs
    //   screenOptions={{
    //     headerShown: false,
    //     tabBarShowLabel: false,
    //   }}>
    //   <Tabs.Screen
    //     name="index"
    //     options={{
    //       headerShown: false,
    //       href: null,
    //     }}
    //   />
    // </Tabs>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="transfers"
        options={{
          headerShown: false,
          headerTitle: "Transfers",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="TransferDetails/[id]"
        options={{
          headerShown: false,
          headerTitle: "Transfer Details",
          headerTintColor: Colors.light.themeColor,
          // headerBackTitle: "Back",
        }}
        
      />
    </Stack>
  );
}
