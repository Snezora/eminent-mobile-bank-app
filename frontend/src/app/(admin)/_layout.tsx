import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Redirect, Stack, Tabs } from "expo-router";
import { Modal, Pressable } from "react-native";

import Colors from "@/src/constants/Colors";
import { useColorScheme } from "@/src/components/useColorScheme";
import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";
import { useAuth } from "@/src/providers/AuthProvider";
import { StatusBar } from "expo-status-bar";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAdmin, loading } = useAuth(); // Access loading state from AuthProvider

  // Wait for loading to complete before checking isAdmin
  if (loading) {
    return null; // Optionally, render a loading spinner or placeholder
  }

  if (!isAdmin) {
    return <Redirect href="/(user)" />;
  }

  return (
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
      <Stack.Screen
        name="LoanDetails/[id]"
        options={{
          headerShown: false,
          headerTitle: "Loan Details",
          headerTintColor: Colors.light.themeColor,
          // headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="loans"
        options={{
          headerShown: false,
          headerTitle: "Loans",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="accounts"
        options={{
          headerShown: false,
          headerTitle: "Accounts",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
