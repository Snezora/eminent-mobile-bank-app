import { Account } from "@/assets/data/types";
import BankTab from "@/src/components/BankTabs";
import Colors from "@/src/constants/Colors";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  RefreshControl,
} from "react-native";
import Animated from "react-native-reanimated";

const TransferSelfPage = () => {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase
        .from("Account")
        .select("*")
        .eq("customer_id", user?.customer_id);

      if (data) setAccounts(data);
    };

    fetchAccounts();
  }, [user]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode
          ? Colors.dark.background
          : Colors.light.background,
      }}
    >
      <Animated.FlatList
        data={accounts}
        renderItem={({ item }) => <BankTab isEWBBank account={item} />}
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: 2,
              backgroundColor: isDarkMode ? "white" : "black",
              marginVertical: 20,
            }}
          />
        )}
        style={{
          paddingHorizontal: 10,
          paddingTop: 35,
        }}
      ></Animated.FlatList>
    </View>
  );
};

const styles = StyleSheet.create({});

export default TransferSelfPage;
