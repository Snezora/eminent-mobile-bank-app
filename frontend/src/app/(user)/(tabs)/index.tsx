import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useColorScheme } from "@/src/components/useColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/src/components/Themed";
import DropdownComponent from "@/src/components/Dropdown";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, router, Stack } from "expo-router";
import QuickActions from "@/src/components/QuickActions";
import { AccountBasicInfoWithEye } from "@/src/components/AccountBasicInfo";
import { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import AdvertisementsCarousel from "@/src/components/AdvertisementsCarousel";
import SettingsLogOut from "@/src/components/SettingsLogOut";
import { useAuth } from "@/src/providers/AuthProvider";
import fetchListofAccounts from "@/src/providers/fetchListofAccounts";
import { Account } from "@/assets/data/types";
import Colors from "@/src/constants/Colors";
import { Alert } from "react-native";
import { useRealtimeSubscription } from "@/src/lib/useRealTimeSubscription";

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const {
    session,
    user,
    isBiometricAuthenticated,
    authenticateBiometric,
    isAdmin,
  } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isEyeOpen, setIsEyeOpen] = useState(true);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);

  // Refresh accounts data
  const refreshAccounts = useCallback(async () => {
    if (!user) return;

    try {
      const accountsData = await fetchListofAccounts({
        isMockEnabled: false,
        isAdmin: false,
        customer_id: "customer_id" in user ? user.customer_id : undefined,
      });

      if (accountsData) {
        const processedAccounts = accountsData.map((account) => ({
          ...account,
          nickname: account.nickname ?? account.account_no,
        }));

        setAccounts(processedAccounts);

        // Only update selected account if it doesn't exist in the new data or if no account is selected
        if (selectedAccount) {
          const updatedSelectedAccount = processedAccounts.find(
            (acc) => acc.account_id === selectedAccount.account_id
          );
          if (updatedSelectedAccount) {
            // Update the selected account with fresh data but keep the same selection
            setSelectedAccount(updatedSelectedAccount);
          } else {
            // Selected account no longer exists, fall back to first account
            setSelectedAccount(processedAccounts[0] || null);
          }
        } else {
          // No account selected, select the first one
          setSelectedAccount(processedAccounts[0] || null);
        }
      }
    } catch (error) {
      console.error("Error refreshing accounts:", error);
    }
  }, [user]); // Remove selectedAccount from dependencies

  // Handle account changes from realtime subscription
  const handleAccountChange = useCallback(
    (payload: any) => {
      console.log("Account change received:", payload);
      refreshAccounts();
    },
    [refreshAccounts]
  );

  // Handle transaction changes from realtime subscription
  const handleTransactionChange = useCallback(
    (payload: any) => {
      console.log("Transaction change received:", payload);
      const transaction = payload.new;

      // Check if this transaction affects any of the user's accounts
      if (
        accounts.some(
          (acc) =>
            acc.account_id === transaction.initiator_account_id ||
            acc.account_no === transaction.receiver_account_no
        )
      ) {
        // Refresh accounts to get updated balances
        refreshAccounts();
      }
    },
    [accounts, refreshAccounts]
  );

  // Set up realtime subscriptions
  useRealtimeSubscription(
    "Account",
    handleAccountChange,
    "*",
    !!user // Only enable when user exists
  );

  // Initial data fetch
  useEffect(() => {
    if (!user) {
      console.log("User is null, skipping fetchListofAccounts");
      return;
    }

    refreshAccounts();

    if (!isAdmin) {
      if (
        user?.date_of_birth == null ||
        user?.phone_no == null ||
        user?.home_address == null ||
        user?.nationality == null ||
        (!user?.passport_no && !user?.ic_no)
      ) {
        // Show an error message or prompt the user to complete their profile
        Alert.alert(
          "Incomplete Profile",
          "Please complete your profile before applying for a loan.",
          [
            {
              text: "OK",
              onPress: () => {
                router.push("/(user)/(tabs)/profile");
              },
            },
          ]
        );
        return;
      }
    }
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
      <ScrollView
        style={{}}
        contentContainerStyle={{
          paddingBottom: 20,
          backgroundColor: isDarkMode
            ? Colors.dark.background
            : Colors.light.background,
        }}
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
              <Text style={[styles.title]}>
                {user?.username ? user?.username : user?.first_name}
              </Text>
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
      </ScrollView>
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
