import { Account, Customer } from "@/assets/data/types";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { fetchCustomerDetails } from "../providers/fetchCustomerDetails";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "@/src/providers/AuthProvider";

const AdminAccountsBlock = ({
  account,
  onPress,
}: {
  account: Account;
  onPress: () => void;
}) => {
  const [customerDetails, setCustomerDetails] = useState<Customer>();
  const [open, setOpen] = useState(false);
  const { isMockEnabled } = useAuth();

  if (!account) {
    return null; // Handle case where account is not provided
  }

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await fetchCustomerDetails(isMockEnabled ?? false, account.customer_id);
        setCustomerDetails(details);
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    };

    fetchDetails();
  }, [account]);

  if (!account) {
    return null; // Handle case where account is not provided
  }

  return (
    <TouchableOpacity style={styles.blockContainer} onPress={onPress}>
      <View
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
          marginRight: 5,
        }}
      >
        <View style={styles.textContainer}>
          <Text style={styles.nameText}>Account ID:</Text>
          <Text style={styles.normalText}>{account.account_no}</Text>
        </View>
        {account.approved_at && (
          <Text
            style={[
              styles.nameText,
              { color: account.account_status === "Active" ? "green" : "red" },
            ]}
          >
            {account.account_status}
          </Text>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>Account Name:</Text>
        <Text style={styles.normalText}>
          {account.nickname ?? "No nickname set"}
        </Text>
      </View>
      <View
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
          marginRight: 5,
        }}
      >
        <View style={styles.textContainer}>
          <Text style={styles.nameText}>Name:</Text>
          <Text style={styles.normalText}>
            {customerDetails
              ? `${customerDetails.first_name} ${customerDetails.last_name}`
              : "Loading..."}
          </Text>
        </View>
        <Text style={styles.normalText}>
          {dayjs(account.created_at).format("DD/MM/YYYY")}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  blockContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "white",
    flexDirection: "column",
    gap: 10,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  normalText: {
    fontSize: 15,
  },
});

export default AdminAccountsBlock;
