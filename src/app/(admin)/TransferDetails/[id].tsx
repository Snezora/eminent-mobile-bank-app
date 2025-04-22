import Colors from "@/src/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { transactions } from "@/assets/data/dummyTransactions";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  convertCurrency,
  convertUSDToMYR,
} from "@/src/providers/convertCurrency";
import dayjs from "dayjs";

const TransferDetails = () => {
  const { transferID } = useLocalSearchParams();

  const transaction = transactions.find(
    (transaction) => transaction.transaction_id === transferID
  );

  if (!transaction) {
    router.push("/+not-found");
  }

  const [newRate, setNewRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchNewRate = async () => {
      const rate = await convertCurrency(
        transaction!.amount,
        "usd",
        "myr",
        dayjs(transaction!.transfer_datetime).format("YYYY-MM-DD")
      );
      setNewRate(rate!);
    };
    fetchNewRate();
  }, [transaction!.amount]);

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
          backgroundColor: Colors.light.themeColorSecondary,
          paddingHorizontal: 10,
          paddingVertical: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
          Transfer Details
        </Text>
      </View>
      <View
        style={{
          backgroundColor: Colors.light.background,
          paddingHorizontal: 10,
          paddingVertical: 30,
          gap: 20,
        }}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Transaction ID: </Text>
          <Text>{transaction?.transaction_id}</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { alignSelf: "center" }]}>Amount: </Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              USD {transaction?.amount.toFixed(2)}
            </Text>
            <View
              style={{
                height: 2,
                backgroundColor: Colors.light.themeColor,
                width: "100%",
              }}
            ></View>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "Black" }}>
              RM {newRate?.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Method of Transfer:</Text>
          <Text>{transaction?.type_of_transfer}</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Transfer Date: </Text>
          <Text>
            {dayjs(transaction?.transfer_datetime).format("YYYY-MM-DD hh:mmA")}{" "}
          </Text>
        </View>
      </View>
      <View
        style={{
          backgroundColor: Colors.light.themeColorSecondary,
          paddingHorizontal: 10,
          paddingVertical: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
          Sender Details
        </Text>
      </View>
      <View
        style={{
          backgroundColor: Colors.light.background,
          paddingHorizontal: 10,
          paddingVertical: 30,
          gap: 20,
          flex: 1 //Remove later
        }}
      ></View>
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
    color: Colors.light.themeColorSecondary,
  },
});

export default TransferDetails;
