import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Colors from "@/src/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Transaction, Account, Customer } from "@/assets/data/types";
import { fetchAccountDetails } from "@/src/providers/fetchAccountDetails";
import { fetchCustomerDetails } from "@/src/providers/fetchCustomerDetails";
import { supabase } from "@/src/lib/supabase";
import dayjs from "dayjs";
import RotatingLogo from "@/src/components/spinningLogo";

const TransferDetails = () => {
  const router = useRouter();
  const { transaction_id } = useLocalSearchParams();
  const isDarkMode = useColorScheme() === "dark";

  // State management
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [senderAccount, setSenderAccount] = useState<Account | null>(null);
  const [receiverAccount, setReceiverAccount] = useState<Account | null>(null);
  const [senderCustomer, setSenderCustomer] = useState<Customer | null>(null);
  const [receiverCustomer, setReceiverCustomer] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    fetchTransactionDetails();
  }, [transaction_id]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);

      // Fetch transaction details
      const { data: transactionData, error: transactionError } = await supabase
        .from("Transaction")
        .select("*")
        .eq("transaction_id", transaction_id)
        .single();

      if (transactionError) {
        console.error("Error fetching transaction:", transactionError);
        Alert.alert("Error", "Failed to load transaction details");
        return;
      }

      if (transactionData) {
        setTransaction(transactionData);

        // Fetch sender account details
        const senderAcc = await fetchAccountDetails(
          false,
          transactionData.initiator_account_id
        );
        setSenderAccount(senderAcc);

        // Fetch receiver account details
        const receiverAcc = await fetchAccountDetails(
          false,
          undefined,
          transactionData.receiver_account_no
        );
        setReceiverAccount(receiverAcc);

        // Fetch sender customer details
        if (senderAcc?.customer_id) {
          const senderCust = await fetchCustomerDetails(
            false,
            senderAcc.customer_id
          );
          setSenderCustomer(senderCust);
        }

        // Fetch receiver customer details
        if (receiverAcc?.customer_id) {
          const receiverCust = await fetchCustomerDetails(
            false,
            receiverAcc.customer_id
          );
          setReceiverCustomer(receiverCust);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "Internal Transfer":
        return "swap-horiz";
      case "External Transfer":
        return "send";
      case "Deposit":
        return "add-circle";
      case "Withdrawal":
        return "remove-circle";
      default:
        return "receipt";
    }
  };

  if (!transaction) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}
      >
        <View style={styles.centerContainer}>
          <MaterialIcons
            name="error-outline"
            size={64}
            color={isDarkMode ? Colors.dark.text : Colors.light.text}
            style={{ opacity: 0.5 }}
          />
          <Text
            style={[
              styles.errorText,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Transaction not found
          </Text>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: Colors.light.themeColor },
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? Colors.dark.background
            : Colors.light.background,
        },
      ]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDarkMode ? Colors.dark.text : Colors.light.text}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { color: isDarkMode ? Colors.dark.text : Colors.light.text },
          ]}
        >
          Transaction Details
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && <RotatingLogo />}
      {!transaction && !loading && (
        <View style={styles.centerContainer}>
          <MaterialIcons
            name="error-outline"
            size={64}
            color={isDarkMode ? Colors.dark.text : Colors.light.text}
            style={{ opacity: 0.5 }}
          />
          <Text
            style={[
              styles.errorText,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Transaction not found
          </Text>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: Colors.light.themeColor },
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && transaction && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Transaction Summary Card */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: Colors.light.themeColor,
              },
            ]}
          >
            <MaterialIcons
              name={getTransactionTypeIcon(transaction.type_of_transfer)}
              size={48}
              color="white"
            />
            <Text style={styles.summaryAmount}>
              RM {transaction.amount.toFixed(2)}
            </Text>
            <Text style={styles.summaryType}>
              {transaction.type_of_transfer}
            </Text>
            <Text style={styles.summaryDate}>
              {dayjs(transaction.transfer_datetime).format(
                "DD MMMM YYYY, hh:mm A"
              )}
            </Text>
          </View>

          {/* Sender Details */}
          <View
            style={[
              styles.detailsCard,
              {
                backgroundColor: isDarkMode
                  ? Colors.dark.firstButton
                  : Colors.light.background,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="person"
                size={24}
                color={isDarkMode ? Colors.dark.text : Colors.light.themeColor}
              />
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                ]}
              >
                Sender Details
              </Text>
            </View>

            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Name:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  {senderCustomer?.first_name} {senderCustomer?.last_name}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Account Number:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  {senderAccount?.account_no || "N/A"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Account Type:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  {senderAccount?.account_type || "N/A"}
                </Text>
              </View>

              {senderAccount?.nickname && (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: isDarkMode
                          ? Colors.dark.text
                          : Colors.light.text,
                      },
                    ]}
                  >
                    Nickname:
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: isDarkMode
                          ? Colors.dark.text
                          : Colors.light.text,
                      },
                    ]}
                  >
                    {senderAccount.nickname}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Receiver Details */}
          <View
            style={[
              styles.detailsCard,
              {
                backgroundColor: isDarkMode
                  ? Colors.dark.firstButton
                  : Colors.light.background,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="person-outline"
                size={24}
                color={isDarkMode ? Colors.dark.text : Colors.light.themeColor}
              />
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                ]}
              >
                Receiver Details
              </Text>
            </View>

            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Name:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  {receiverCustomer?.first_name} {receiverCustomer?.last_name} 
                  {receiverCustomer?.customer_id === senderCustomer?.customer_id
                    ? " (Own)"
                    : null}
                  </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Account Number:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  {receiverAccount?.account_no ||
                    transaction.receiver_account_no}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Account Type:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  {receiverAccount?.account_type || "N/A"}
                </Text>
              </View>

              {receiverAccount?.nickname && (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: isDarkMode
                          ? Colors.dark.text
                          : Colors.light.text,
                      },
                    ]}
                  >
                    Nickname:
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: isDarkMode
                          ? Colors.dark.text
                          : Colors.light.text,
                      },
                    ]}
                  >
                    {receiverAccount.nickname}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Transaction Details */}
          <View
            style={[
              styles.detailsCard,
              {
                backgroundColor: isDarkMode
                  ? Colors.dark.firstButton
                  : Colors.light.background,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="receipt"
                size={24}
                color={isDarkMode ? Colors.dark.text : Colors.light.themeColor}
              />
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                ]}
              >
                Transaction Details
              </Text>
            </View>

            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Transaction ID:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    styles.monospace,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  {transaction.transaction_id}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Amount:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    styles.amountText,
                    { color: isDarkMode ? Colors.dark.themeColorSecondary : Colors.light.themeColor },
                  ]}
                >
                  RM {transaction.amount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Transfer Type:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  {transaction.type_of_transfer}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Date & Time:
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  {dayjs(transaction.transfer_datetime).format(
                    "DD MMMM YYYY, hh:mm:ss A"
                  )}
                </Text>
              </View>

              {transaction.purpose && (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: isDarkMode
                          ? Colors.dark.text
                          : Colors.light.text,
                      },
                    ]}
                  >
                    Purpose:
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: isDarkMode
                          ? Colors.dark.text
                          : Colors.light.text,
                      },
                    ]}
                  >
                    {transaction.purpose}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: Colors.light.themeColor },
              ]}
              onPress={() => {
                // TODO: Implement share functionality
                Alert.alert("Share", "Share functionality coming soon!");
              }}
            >
              <MaterialIcons name="share" size={20} color="white" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: isDarkMode
                    ? Colors.dark.firstButton
                    : Colors.light.background,
                  borderWidth: 1,
                  borderColor: Colors.light.themeColor,
                },
              ]}
              onPress={() => {
                // TODO: Implement download functionality
                Alert.alert("Download", "Download functionality coming soon!");
              }}
            >
              <MaterialIcons
                name="download"
                size={20}
                color={isDarkMode ? Colors.dark.text : Colors.light.themeColor}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.themeColor },
                ]}
              >
                Download
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 10,
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  summaryCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },
  summaryType: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
    marginTop: 5,
  },
  summaryDate: {
    fontSize: 14,
    color: "white",
    opacity: 0.8,
    marginTop: 5,
  },
  detailsCard: {
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  detailsContent: {
    padding: 20,
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    flex: 1.5,
    textAlign: "right",
    fontWeight: "400",
  },
  monospace: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusText: {
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
});

export default TransferDetails;
