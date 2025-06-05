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
import fetchListofAccounts from "@/src/providers/fetchListofAccounts";
import { Account } from "@/assets/data/types";
import Colors from "@/src/constants/Colors";
import { Alert } from "react-native";

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { session, user, isBiometricAuthenticated, authenticateBiometric } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isEyeOpen, setIsEyeOpen] = useState(true);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);

  const handleEyePress = async () => {
    try {
      if (!isBiometricAuthenticated) {
        const hasAuthenticated = await LocalAuthentication.authenticateAsync();
        if (hasAuthenticated.success) {
          setHasAuthenticated(true);
          setIsEyeOpen(!isEyeOpen);
        } else {
          console.log("Authentication failed");
          Alert.alert(
            "Authentication Failed",
            "Unable to authenticate. Please try again.",
            [{ text: "OK" }]
          );
          return;
        }
      } else {
        setIsEyeOpen(!isEyeOpen);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred during authentication. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  useEffect(() => {
    if (!user) {
      console.log("User is null, skipping fetchListofAccounts");
      return;
    }

    const accounts = fetchListofAccounts({
      isMockEnabled: false,
      isAdmin: false,
      customer_id: user!.customer_id,
    });

    if (!accounts) {
      return;
    }

    accounts.then((data) => {
      const processedAccounts = data!.map((account) => ({
        ...account,
        nickname: account.nickname ?? account.account_no,
      }));

      setAccounts(processedAccounts);
      setSelectedAccount(processedAccounts[0]);
    });
  }, [user]);

  const handleSelect = (item: any) => {
    setSelectedAccount(item);
  };

  const centerTextStyle =
    colorScheme === "light" ? styles.lightThemeText : styles.darkThemeText;
  const centerContainerStyle =
    colorScheme === "light" ? styles.lightContainer : styles.darkContainer;

  if (!session) {
    return <Redirect href="/(auth)/home-page" />;
  }

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
            // alignItems: "center",
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
            labelField={"nickname"}
            valueField={"account_no"}
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
    backgroundColor: Colors.dark.background,
  },
  lightThemeText: {
    color: "black",
  },
  darkThemeText: {
    color: "#E0E0E0",
  },
});
