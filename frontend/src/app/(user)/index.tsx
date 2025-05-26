import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useColorScheme } from "@/src/components/useColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/src/components/Themed";
import DropdownComponent from "@/src/components/Dropdown";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Stack } from "expo-router";
import QuickActions from "@/src/components/QuickActions";
import { AccountBasicInfoWithEye } from "@/src/components/AccountBasicInfo";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import AdvertisementsCarousel from "@/src/components/AdvertisementsCarousel";
import SettingsLogOut from "@/src/components/SettingsLogOut";
import { useAuth } from "@/src/providers/AuthProvider";

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const { session, user } = useAuth();

  if (!session) {
    return <Redirect href="/(auth)/home-page" />;
  }

  const accounts = [
    { name: "Account 1", balance: 1000, accountNo: "2039 0929 2837" },
    { name: "Account 2", balance: 2000, accountNo: "2039 0929 2451" },
    { name: "Account 3", balance: 3000, accountNo: "2039 2345 6743" },
    { name: "Account 4", balance: 4000, accountNo: "2039 0929 2345" },
  ];

  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);

  const handleSelect = (item: any) => {
    setSelectedAccount(item);
    console.log(session);
  };

  const centerTextStyle =
    colorScheme === "light" ? styles.lightThemeText : styles.darkThemeText;
  const centerContainerStyle =
    colorScheme === "light" ? styles.lightContainer : styles.darkContainer;

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#385A93" }]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topContainer]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={[styles.title]}>Welcome back,</Text>
            <Text style={[styles.title]}>Lester</Text>
          </View>
          <SettingsLogOut />
        </View>

        <View style={{ marginTop: 20, maxWidth: 200 }}>
          <DropdownComponent
            data={accounts}
            labelField={"name"}
            valueField={"accountNo"}
            onSelect={handleSelect}
          />
        </View>
        <AccountBasicInfoWithEye account={selectedAccount} />
      </View>
      <View style={[styles.bottomContainer, centerContainerStyle]}>
        <View style={styles.individualContainer}>
          <View style={styles.addPadding}>
            <Text style={[styles.title, centerTextStyle]}>Quick Actions</Text>
          </View>
          <QuickActions />
        </View>
        <View style={styles.individualContainer}>
          <View style={styles.addPadding}>
            <Text style={[styles.title, centerTextStyle]}>
              Ongoing Promotions
            </Text>
          </View>
          <AdvertisementsCarousel />
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
    backgroundColor: "#385A93",
  },
  lightTopThemeText: {
    color: "black",
  },
  darkTopThemeText: {
    color: "white",
  },
  bottomContainer: {
    flex: 1,
    paddingTop: 35,
    gap: 45,
  },
  individualContainer: {
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  addPadding: {
    paddingLeft: 20,
  },
  accNo: {
    fontSize: 16,
    color: "white",
    marginTop: 20,
    marginBottom: 15,
    fontWeight: "bold",
  },
  lightContainer: {
    backgroundColor: "#eeeeee",
  },
  darkContainer: {
    backgroundColor: "#4A4A4A",
  },
  lightThemeText: {
    color: "black",
  },
  darkThemeText: {
    color: "#E0E0E0",
  },
});
