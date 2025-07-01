import adminSignUp from "@/src/components/AdminSignUp";
import SettingsLogOut from "@/src/components/SettingsLogOut";
import Colors from "@/src/constants/Colors";
import { supabase } from "@/src/lib/supabase";
import { Redirect, router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  useColorScheme,
  Button,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, DateTimePicker } from "react-native-ui-lib";
import { useAuth } from "@/src/providers/AuthProvider";
import { useEffect, useState } from "react";
import { FontAwesome6 } from "@expo/vector-icons";
import { Account, Admin, Loan } from "@/assets/data/types";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import dayjs from "dayjs";

var width = Dimensions.get("window").width; //full width

const AdminPage = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { session, isAdmin } = useAuth();
  const [data, setData] = useState<{ label: string; value: number }[]>([]);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [pendingAccounts, setPendingAccounts] = useState<Account[]>([]);
  const [pendingLoans, setPendingLoans] = useState<Loan[]>([]);

  const cardContainerStyle = isDarkMode
    ? {
        backgroundColor: "rgba(255, 255, 255, 0.09)",
      }
    : { backgroundColor: "white" };

  const bottomCardContainerStyle = isDarkMode
    ? {
        backgroundColor: "rgba(255, 255, 255, 0.16)",
      }
    : {
        backgroundColor: "white",
      };

  useEffect(() => {
    if (!session || !isAdmin) {
      router.push("/(auth)/home-page");
      return;
    }
    const fetchAdminDetails = async () => {
      try {
        const { data: adminData, error } = await supabase
          .from("Admin")
          .select("*")
          .eq("user_uuid", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching admin details:", error);
          return;
        }

        setAdmin(adminData);
      } catch (error) {
        console.error("Error fetching admin details:", error);
      }
    };

    fetchAdminDetails();

    const fetchTodayAmountofTransactions = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(
          today.setHours(23, 59, 59, 999)
        ).toISOString();

        const { data: transactions, error } = await supabase
          .from("Transaction")
          .select("amount, transfer_datetime")
          .gte("transfer_datetime", startOfDay)
          .lt("transfer_datetime", endOfDay);

        if (error) {
          console.error("Error fetching today's transactions:", error);
          return;
        }

        const processedData = transactions.map((transaction) => ({
          label: new Date(transaction.transfer_datetime).toLocaleDateString(),
          value: transaction.amount,
        }));

        // console.log("Processed Data: ", processedData

        setData(processedData);
      } catch (error) {
        console.error("Error fetching today's transactions:", error);
      }
    };

    fetchTodayAmountofTransactions();

    // Fetch pending accounts
    const fetchPendingAccounts = async () => {
      try {
        const { data: pendingAccounts, error } = await supabase
          .from("Account")
          .select("*")
          .eq("account_status", "Pending");

        if (error) {
          console.error("Error fetching pending accounts:", error);
          return;
        }

        // Process pending accounts if needed
        // console.log("Pending Accounts: ", pendingAccounts);
        setPendingAccounts(pendingAccounts);
      } catch (error) {
        console.error("Error fetching pending accounts:", error);
      }
    };

    fetchPendingAccounts();

    // Fetch pending loans
    const fetchPendingLoans = async () => {
      try {
        const { data: pendingLoans, error } = await supabase
          .from("Loan")
          .select("*")
          .is("final_approval", null);

        if (error) {
          console.error("Error fetching pending loans:", error);
          return;
        }

        // Process pending loans if needed
        // console.log("Pending Loans: ", pendingLoans);
        setPendingLoans(pendingLoans);
      } catch (error) {
        console.error("Error fetching pending loans:", error);
      }
    };

    fetchPendingLoans();
  }, []);

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: Colors.light.themeColor }]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          paddingHorizontal: 20,
          gap: 5,
          paddingTop: 15,
          paddingBottom: 30,
        }}
      >
        <View style={[styles.header]}>
          <Text style={[styles.headerText]}>Admin Dashboard</Text>
          <SettingsLogOut />
        </View>
        <Text style={[styles.headerText]}>Good Evening, </Text>
        <Text style={[styles.headerText]}>{admin?.username}</Text>
      </View>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}
      >
        <Text
          style={{
            color: isDarkMode ? Colors.dark.text : Colors.light.text,
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          {dayjs().format("MMMM D, YYYY")}
        </Text>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            flexWrap: "wrap",
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.themeColorTertiary,
          }}
        >
          <Card style={[styles.upperCard, cardContainerStyle]}>
            <FontAwesome6
              name="money-bill-transfer"
              size={24}
              color={
                isDarkMode
                  ? Colors.light.themeColorSecondary
                  : Colors.light.themeColor
              }
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: isDarkMode ? Colors.light.background : "black",
                textAlign: "center",
              }}
            >
              {data.length}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: isDarkMode ? Colors.light.background : "black",
                textAlign: "center",
              }}
            >
              Transfers Today
            </Text>
          </Card>
          <Card style={[styles.upperCard, cardContainerStyle]}>
            <FontAwesome6
              name="user-clock"
              size={24}
              color={
                isDarkMode
                  ? Colors.light.themeColorSecondary
                  : Colors.light.themeColor
              }
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: isDarkMode ? Colors.light.background : "black",
                textAlign: "center",
              }}
            >
              {pendingAccounts.length}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: isDarkMode ? Colors.light.background : "black",
                textAlign: "center",
              }}
            >
              Pending Accounts
            </Text>
          </Card>
          <Card style={[styles.upperCard, cardContainerStyle]}>
            <FontAwesome6
              name="file-invoice-dollar"
              size={24}
              color={
                isDarkMode
                  ? Colors.light.themeColorSecondary
                  : Colors.light.themeColor
              }
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: isDarkMode ? Colors.light.background : "black",
                textAlign: "center",
              }}
            >
              {pendingLoans.length}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: isDarkMode ? Colors.light.background : "black",
                textAlign: "center",
              }}
            >
              Pending Loans
            </Text>
          </Card>
        </View>
        <View
          style={[
            styles.lowerContainer,
            {
              backgroundColor: isDarkMode
                ? Colors.dark.background
                : Colors.light.background,
            },
          ]}
        >
          <Card
            style={[styles.cards, bottomCardContainerStyle]}
            onPress={() => router.push("/(admin)/transfers")}
          >
            <FontAwesome6
              name="money-bill-transfer"
              size={36}
              color={isDarkMode ? "white" : "black"}
            />
            <Text
              style={[
                styles.cardText,
                { color: isDarkMode ? "white" : "black" },
              ]}
            >
              Transfers
            </Text>
          </Card>
          <Card
            style={[styles.cards, bottomCardContainerStyle]}
            onPress={() => router.push("/(admin)/accounts")}
          >
            <FontAwesome6
              name="user-group"
              size={36}
              color={isDarkMode ? "white" : "black"}
            />
            <Text
              style={[
                styles.cardText,
                { color: isDarkMode ? "white" : "black" },
              ]}
            >
              Accounts
            </Text>
          </Card>
          <Card
            style={[styles.cards, { width: "100%" }, bottomCardContainerStyle]}
            onPress={() => router.push("/(admin)/loans")}
          >
            <FontAwesome6
              name="file-invoice-dollar"
              size={36}
              color={isDarkMode ? "white" : "black"}
            />
            <Text
              style={[
                styles.cardText,
                { color: isDarkMode ? "white" : "black" },
              ]}
            >
              Loans
            </Text>
          </Card>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.themeColor,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    paddingVertical: 15,
    paddingTop: 35,
    overflowX: "hidden",
    gap: 20,
  },
  lowerContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f3f3",
    overflowX: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cards: {
    width: "45%",
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    textAlign: "center",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  upperCard: {
    paddingHorizontal: 10,
    backgroundColor: "white",
    maxWidth: "30%",
    alignItems: "center",
    gap: 3,
    paddingVertical: 20,
    justifyContent: "center",
  },
});

export default AdminPage;
