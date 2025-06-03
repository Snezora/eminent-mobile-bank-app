import Colors from "@/src/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { transactions } from "@/assets/data/dummyTransactions";
import { accounts } from "@/assets/data/dummyAccounts";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  convertCurrency,
  convertUSDToMYR,
} from "@/src/providers/convertCurrency";
import dayjs from "dayjs";
import { Account, Customer } from "@/assets/data/types";
import { fetchAccountDetails } from "@/src/providers/fetchAccountDetails";
import { fetchCustomerDetails } from "@/src/providers/fetchCustomerDetails";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import fetchTransactionDetails from "@/src/providers/fetchTransactionDetails";
import { useAuth } from "@/src/providers/AuthProvider";

const TransferDetails = () => {
  const { transferID } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [transaction, setTransaction] = useState<any | null>(null);
  const [newRate, setNewRate] = useState<number | string | null>("...");
  const [loading, setLoading] = useState(true);
  const [senderAccount, setSenderAccount] = useState<Account | undefined>(
    undefined
  );
  const [receiverAccount, setReceiverAccount] = useState<Account | undefined>(
    undefined
  );
  const [senderCustomer, setSenderCustomer] = useState<Customer | undefined>(
    undefined
  );
  const [receiverCustomer, setReceiverCustomer] = useState<
    Customer | undefined
  >(undefined);
  const { isMockEnabled } = useAuth();

  useEffect(() => {
    const fetchAllDetails = async () => {
      const fetchedTransaction = await fetchTransactionDetails(
        transferID as string
      );
      if (!fetchedTransaction) {
        router.push("/+not-found");
        return;
      }
      setTransaction(fetchedTransaction);

      const sender = await fetchAccountDetails(
        isMockEnabled ?? false,
        fetchedTransaction?.initiator_account_id
      );
      const senderCustomer = await fetchCustomerDetails(
        isMockEnabled ?? false,
        sender?.customer_id
      );
      setSenderAccount(sender);
      setSenderCustomer(senderCustomer);

      const receiver = await fetchAccountDetails(
        isMockEnabled ?? false,
        undefined,
        fetchedTransaction?.receiver_account_no
      );
      const receiverCustomer = await fetchCustomerDetails(
        isMockEnabled ?? false,
        receiver?.customer_id
      );
      setReceiverAccount(receiver);
      setReceiverCustomer(receiverCustomer);

      const rate = await convertCurrency(
        fetchedTransaction.amount,
        "usd",
        "myr",
        dayjs(fetchedTransaction.transfer_datetime).format("YYYY-MM-DD")
      );
      setNewRate(rate!);
      setLoading(false);
    };
    fetchAllDetails();
  }, [transferID]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.light.themeColor }}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Ionicons name="chevron-back-outline" size={24} color="white" />
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          Back To Transfers
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode
            ? Colors.dark.background
            : Colors.light.background,
        }}
      >
        {loading && (
          <Animated.View
            exiting={FadeOut.duration(1000)}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isDarkMode
                ? Colors.dark.background
                : Colors.light.background,
            }}
          >
            <ActivityIndicator
              size="large"
              color={Colors.light.themeColor}
              style={{ marginBottom: 20 }}
            />
          </Animated.View>
        )}
        {!loading && (
          <Animated.View entering={FadeIn.duration(1000)} style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: isDarkMode
                  ? Colors.dark.themeColorSecondary
                  : Colors.light.themeColorSecondary,
                paddingHorizontal: 10,
                paddingVertical: 15,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "white" }}
              >
                Transfer Details
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isDarkMode
                  ? Colors.dark.background
                  : Colors.light.background,
                paddingHorizontal: 10,
                paddingBottom: 30,
                paddingTop: 20,
                gap: 20,
              }}
            >
              <View style={[styles.formContainer, { alignItems: "center" }]}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Transaction ID:{" "}
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    flexWrap: "wrap",
                    flex: 1,
                    alignSelf: "center",
                    maxWidth: "50%",
                    color: isDarkMode ? "white" : "black",
                  }}
                >
                  {transaction?.transaction_id}
                </Text>
              </View>
              <View style={styles.formContainer}>
                <Text
                  style={[
                    styles.title,
                    {
                      alignSelf: "center",
                      color: isDarkMode ? "white" : "black",
                    },
                  ]}
                >
                  Amount:{" "}
                </Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: isDarkMode ? "white" : "black" }}>
                    USD {transaction?.amount.toFixed(2)}
                  </Text>
                  <View
                    style={{
                      height: 2,
                      backgroundColor: Colors.light.themeColor,
                      width: "100%",
                    }}
                  ></View>
                  <Text style={{ color: isDarkMode ? "white" : "black" }}>
                    RM{" "}
                    {typeof newRate == "number" ? newRate.toFixed(2) : newRate}
                  </Text>
                </View>
              </View>
              <View style={styles.formContainer}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Method of Transfer:
                </Text>
                <Text style={{ color: isDarkMode ? "white" : "black" }}>
                  {transaction?.type_of_transfer}
                </Text>
              </View>
              <View style={styles.formContainer}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Transfer Date:{" "}
                </Text>
                <Text style={{ color: isDarkMode ? "white" : "black" }}>
                  {dayjs(transaction?.transfer_datetime).format(
                    "YYYY-MM-DD hh:mmA"
                  )}{" "}
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: Colors.light.themeColorSecondary,
                paddingHorizontal: 10,
                paddingVertical: 15,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "white" }}
              >
                Sender Details
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isDarkMode
                  ? Colors.dark.background
                  : Colors.light.background,
                paddingHorizontal: 10,
                paddingBottom: 30,
                paddingTop: 20,
                gap: 20,
              }}
            >
              <View style={[styles.formContainer, { alignItems: "center" }]}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Sender Account No:{" "}
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    flexWrap: "wrap",
                    flex: 1,
                    alignSelf: "center",
                    maxWidth: "50%",
                    color: isDarkMode ? "white" : "black",
                  }}
                >
                  {senderAccount?.account_no}
                </Text>
              </View>
              <View style={[styles.formContainer, { alignItems: "center" }]}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Sender Account Nickname:{" "}
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    flexWrap: "wrap",
                    flex: 1,
                    alignSelf: "center",
                    maxWidth: "50%",
                    color: isDarkMode ? "white" : "black",
                  }}
                >
                  {senderAccount?.nickname ?? "No Nickname Set"}
                </Text>
              </View>
              <View style={styles.formContainer}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Sender Name:
                </Text>
                <Text style={{ color: isDarkMode ? "white" : "black" }}>
                  {senderCustomer?.first_name + " " + senderCustomer?.last_name}
                </Text>
              </View>
              <View style={styles.formContainer}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Sender Phone Number:
                </Text>
                <Text style={{ color: isDarkMode ? "white" : "black" }}>
                  {senderCustomer?.phone_no}
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: isDarkMode
                  ? Colors.dark.themeColorSecondary
                  : Colors.light.themeColorSecondary,
                paddingHorizontal: 10,
                paddingVertical: 15,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "white" }}
              >
                Receiver Details
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isDarkMode
                  ? Colors.dark.background
                  : Colors.light.background,
                paddingHorizontal: 10,
                paddingBottom: 30,
                paddingTop: 20,
                gap: 20,
              }}
            >
              <View style={[styles.formContainer, { alignItems: "center" }]}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Receiver Account No:{" "}
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    flexWrap: "wrap",
                    flex: 1,
                    alignSelf: "center",
                    maxWidth: "50%",
                    color: isDarkMode ? "white" : "black",
                  }}
                >
                  {receiverAccount?.account_no}
                </Text>
              </View>
              <View style={styles.formContainer}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Receiver Account Nickname:
                </Text>
                <Text style={{ color: isDarkMode ? "white" : "black" }}>
                  {receiverAccount?.nickname ?? "No Nickname Set"}
                </Text>
              </View>
              <View style={styles.formContainer}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Receiver Name:
                </Text>
                <Text style={{ color: isDarkMode ? "white" : "black" }}>
                  {receiverCustomer?.first_name +
                    " " +
                    receiverCustomer?.last_name}
                </Text>
              </View>
              <View style={styles.formContainer}>
                <Text
                  style={[
                    styles.title,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Receiver Phone Number:
                </Text>
                <Text style={{ color: isDarkMode ? "white" : "black" }}>
                  {receiverCustomer?.phone_no}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 10,
    backgroundColor: Colors.light.themeColor,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerIcon: {
    color: "white",
  },
  formContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#777",
  },
});

export default TransferDetails;
