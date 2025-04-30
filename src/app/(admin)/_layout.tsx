import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Redirect, Stack, Tabs } from "expo-router";
import { Modal, Pressable } from "react-native";

import Colors from "@/src/constants/Colors";
import { useColorScheme } from "@/src/components/useColorScheme";
import { useClientOnlyValue } from "@/src/components/useClientOnlyValue";
import { useAuth } from "@/src/providers/AuthProvider";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAdmin } = useAuth();

  // if (!isAdmin) {
  //   return <Redirect href="/sign-in"/>;
  // }

  return (
    // <Tabs
    //   screenOptions={{
    //     headerShown: false,
    //     tabBarShowLabel: true,
    //   }}
    // >
    //   <Tabs.Screen
    //     name="index"
    //     options={{
    //       title: "Home",
    //       headerShown: false,
    //       href: "/(admin)",
    //       tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="loans"
    //     options={{
    //       title: "Loans",
    //       href: "/(admin)/loans",
    //       tabBarIcon: ({ color }) => <TabBarIcon name="money" color={color} />,
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="transfers"
    //     options={{
    //       href: "/(admin)/transfers",
    //       tabBarIcon: ({ color }) => (
    //         <TabBarIcon name="exchange" color={color} />
    //       ),
    //       tabBarStyle: { display: "none" },
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="TransferDetails/[id]"
    //     options={{
    //       href: "/(admin)/transfers",
    //       tabBarIcon: ({ color }) => (
    //         <TabBarIcon name="exchange" color={color} />
    //       ),
    //       tabBarItemStyle: { display: "none" },
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
      <Stack.Screen
        name="loans"
        options={{
          headerShown: false,
          headerTitle: "Loans",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
