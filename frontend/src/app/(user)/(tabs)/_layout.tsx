import { Redirect, Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import Colors from "@/src/constants/Colors";
import { useAuth } from "@/src/providers/AuthProvider";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/(auth)/home-page"  />;
  }
  

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:
          colorScheme === "dark"
            ? Colors.light.themeColorSecondary
            : Colors.light.themeColor,
        tabBarInactiveTintColor:
          colorScheme === "dark"
            ? "rgba(255, 255, 255, 0.5)"
            : "rgba(0, 0, 0, 0.5)",
        headerShown: false, // Hide headers for all tabs
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
