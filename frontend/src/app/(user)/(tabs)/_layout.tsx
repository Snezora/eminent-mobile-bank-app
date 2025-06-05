import { Redirect, Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme, View } from "react-native";
import Colors from "@/src/constants/Colors";
import { useAuth } from "@/src/providers/AuthProvider";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session } = useAuth();

  // TODO: FOR SOME REASON, IT UNSUBSCRIBES FAILED WHEN TRANSFER

  if (!session) {
    return <Redirect href="/(auth)/home-page" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:
          colorScheme === "dark"
            ? Colors.light.themeColorSecondary
            : Colors.light.themeColorSecondary,
        tabBarInactiveTintColor:
          colorScheme === "dark"
            ? "rgba(255, 255, 255, 0.5)"
            : "rgba(255, 255, 255, 0.5)",
        headerShown: false, // Hide headers for all tabs
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 5,
          backgroundColor:
            colorScheme === "dark"
              ? Colors.dark.firstButton
              : Colors.dark.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Accounts",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bank" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
