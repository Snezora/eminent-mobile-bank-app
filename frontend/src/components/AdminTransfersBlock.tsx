import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Transaction } from "@/assets/data/types";
import { accounts } from "@/assets/data/dummyAccounts";
import { customers } from "@/assets/data/dummyCustomers";
import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";
import fx, { convert } from "money";
import { convertUSDToMYR } from "../providers/convertCurrency";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { fetchAccountDetails } from "../providers/fetchAccountDetails";
import { fetchCustomerDetails } from "../providers/fetchCustomerDetails";
import { useAuth } from "../providers/AuthProvider";

const AdminTransfersBlock = (transaction: Transaction) => {
  const [newRate, setNewRate] = useState<number | null>(null);
  const [senderName, setSenderName] = useState<string | null>(null);
  const [receiverName, setReceiverName] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { isMockEnabled } = useAuth();

  useEffect(() => {
    const fetchNewRate = async () => {
      const rate = await convertUSDToMYR(transaction.amount);
      setNewRate(rate);
    };
    fetchNewRate();
  }, [transaction.amount]);

  useEffect(() => {
    const getSenderName = async () => {
      try {
        const account = await fetchAccountDetails(
          isMockEnabled ?? false,
          transaction.initiator_account_id
        );

        if (account) {
          const customer = await fetchCustomerDetails(
            isMockEnabled ?? false,
            account.customer_id
          );

          const lastNameParts = customer?.last_name?.split(" ");
          const initial =
            lastNameParts && lastNameParts.length > 1
              ? lastNameParts[1].charAt(0)
              : lastNameParts?.[0]?.charAt(0);

          setSenderName(customer?.first_name + " " + initial + ".");
        } else {
          setSenderName(null);
        }
      } catch (error) {
        console.error("Error in getSenderName:", error);
        setSenderName("Unknown");
      }
    };
    getSenderName();
  }, [transaction.initiator_account_id]);

  useEffect(() => {
    const getReceiverName = async () => {
      try {
        const account = await fetchAccountDetails(
          isMockEnabled ?? false,
          undefined,
          transaction.receiver_account_no
        );
        if (account) {
          const customer = await fetchCustomerDetails(
            isMockEnabled ?? false,
            account.customer_id
          );
          const lastNameParts = customer?.last_name?.split(" ");
          const initial =
            lastNameParts && lastNameParts.length > 1
              ? lastNameParts[1].charAt(0)
              : lastNameParts?.[0]?.charAt(0);

          setReceiverName(customer?.first_name + " " + initial + ".");
        } else {
          setReceiverName(null);
        }
      } catch (error) {
        console.error("Error in getReceiverName:", error);
        setReceiverName("Unknown");
      }
    };
    getReceiverName();
  }, [transaction.receiver_account_no]);

  return (
    <TouchableOpacity
      onPress={(event) =>
        router.push({
          pathname: "/TransferDetails/[id]",
          params: { transferID: transaction.transaction_id },
        })
      }
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.25)" : "#fff",
          },
        ]}
      >
        <View style={styles.leftContainer}>
          <Text
            style={[styles.text, { color: isDarkMode ? "#d0d0c0" : "#000" }]}
          >
            {dayjs(transaction.transfer_datetime).format("YYYY-MM-DD")}
          </Text>
          <Text
            style={[styles.text, { color: isDarkMode ? "#d0d0c0" : "#000" }]}
          >
            {senderName ?? "Loading..."}
          </Text>
        </View>
        <View style={styles.middleContainer}>
          <Text
            style={[styles.text, { color: isDarkMode ? "#d0d0c0" : "#000" }]}
          >
            $ {transaction.amount.toFixed(2)}
          </Text>
          {/* <Text style={styles.text}>RM {newRate?.toFixed(2)}</Text> */}
          <FontAwesome
            name="long-arrow-right"
            color={isDarkMode ? "white" : "#000"}
            size={32}
          />
          <Text
            style={[
              styles.text,
              {
                fontSize: 12,
                fontWeight: "bold",
                color: isDarkMode ? "#d0d0c0" : "#000",
                textAlign: "center",
              },
            ]}
          >
            {transaction.type_of_transfer === "Customer Transfer"
              ? "Internal Transfer"
              : transaction.type_of_transfer}
          </Text>
        </View>
        <View style={styles.rightContainer}>
          <Text
            style={[styles.text, { color: isDarkMode ? "#d0d0c0" : "#000" }]}
          >
            {dayjs(transaction.transfer_datetime).format("HH:mm")}
          </Text>
          <Text
            style={[styles.text, { color: isDarkMode ? "#d0d0c0" : "#000" }]}
          >
            {receiverName ?? "Loading..."}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: "row",
    marginHorizontal: 20,
  },
  leftContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  middleContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 5,
  },
  text: {
    fontSize: 16,
  },
});

export default AdminTransfersBlock;
