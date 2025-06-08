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
      <Stack.Screen
        name="camera"
        options={{
          title: "Camera",
          gestureEnabled: true,
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            console.log("Camera screen focused");
            navigation.setParams({ cameraActive: true, hasScanned: false }); // Activate the camera
          },
          blur: () => {
            console.log("Camera screen blurred");
            navigation.setParams({ cameraActive: false, hasScanned: true }); // Deactivate the camera
          },
        })}
      />
      <Stack.Screen
        name="(transfer)/transferHome"
        options={{
          title: "Transfer",
          gestureEnabled: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(transfer)/newTransfer"
        options={{
          title: "Transfer",
          gestureEnabled: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(transfer)/transferConfirmation"
        options={{ headerShown: false, gestureEnabled: true }}
      />
      <Stack.Screen
        name="accountDetails"
        options={{
          title: "Account Details",
          gestureEnabled: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(transfer)/transferHistory"
        options={{ headerShown: false, gestureEnabled: true }}
      />
      <Stack.Screen
        name="(transfer)/transferDetails"
        options={{ headerShown: false, gestureEnabled: true }}
      />
      <Stack.Screen
        name="newAccount"
        options={{ headerShown: false, gestureEnabled: true }}
      />
      <Stack.Screen
        name="newLoan"
        options={{ headerShown: false, gestureEnabled: true }}
      />
    </Stack>
  );
}
