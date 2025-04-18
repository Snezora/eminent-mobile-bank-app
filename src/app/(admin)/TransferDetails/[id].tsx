import Colors from "@/src/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { transactions } from "@/assets/data/dummyTransactions";
import { Ionicons } from "@expo/vector-icons";

const TransferDetails = () => {
  const { transferID } = useLocalSearchParams();

  const transaction = transactions.find(
    (transaction) => transaction.transaction_id === transferID
  );

  if (!transaction) {
    router.push("/+not-found")
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.light.themeColor }}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Ionicons name="chevron-back-outline" size={24} color="white" />
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          paddingHorizontal: 10,
          paddingVertical: 20,
        }}
      >
        <Text>{transaction?.transaction_id}</Text>
        <Text>{transaction?.amount}</Text>
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
});

export default TransferDetails;
