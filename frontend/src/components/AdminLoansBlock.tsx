import { loans } from "@/assets/data/dummyLoans";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Customer, Loan } from "@/assets/data/types";
import Colors from "../constants/Colors";
import { customers } from "@/assets/data/dummyCustomers";
import { fetchCustomerDetails } from "../providers/fetchCustomerDetails";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useAuth } from "@/src/providers/AuthProvider";

const AdminLoansBlock = ({ loan }: { loan: Loan }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const finalResult = loan.final_approval;
  const ColorMap = {
    true: isDarkMode ? "lightgreen" : "green",
    false: Colors.light.themeColorReject,
    null: isDarkMode
      ? Colors.dark.themeColorSecondary
      : Colors.light.themeColor, 
  };

  const colorKey =
    finalResult === null ? "null" : finalResult ? "true" : "false";

  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const { isMockEnabled } = useAuth();

  useEffect(() => {
    const fetchCustomer = async () => {
      const fetchedCustomer = await fetchCustomerDetails(
        isMockEnabled ?? false,
        loan.customer_id
      );
      setCustomer(fetchedCustomer);
    };
    fetchCustomer();
  }, [loan.customer_id]);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={(event) =>
        router.push({
          pathname: "/LoanDetails/[id]",
          params: { id: loan.loan_id },
        })
      }
    >
      <View
        style={[
          styles.blockContainer,
          {
            borderColor: ColorMap[colorKey],
            backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.25)" : "white",
          },
        ]}
      >
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.nameText,
              { color: isDarkMode ? Colors.dark.text : "black" },
            ]}
          >
            # {loan.loan_id}
          </Text>
          <Text
            style={[
              styles.nameText,
              { color: isDarkMode ? Colors.dark.text : "black" },
            ]}
          >
            {dayjs(loan.application_date).format("DD/MM/YYYY")}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.nameText,
              { color: isDarkMode ? Colors.dark.text : "black" },
            ]}
          >
            {customer?.first_name} {customer?.last_name}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.nameText,
              { color: isDarkMode ? Colors.dark.text : "black" },
            ]}
          >
            USD {loan.loan_amount.toFixed(2)}
          </Text>
          <Text style={[styles.nameText, { color: ColorMap[colorKey] }]}>
            {finalResult === null
              ? "Pending"
              : finalResult
              ? "Approved"
              : "Rejected"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  blockContainer: {
    borderWidth: 3,
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
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default AdminLoansBlock;
