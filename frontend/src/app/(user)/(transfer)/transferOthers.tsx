import { Account } from "@/assets/data/types";
import BankTab from "@/src/components/BankTabs";
import Colors from "@/src/constants/Colors";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Animated from "react-native-reanimated";

type ExternalAccountProps = {
  bankName: string;
  full_bank_name: string;
  account_no: string;
  nickname: string;
};

const TransferOthersPage = () => {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [accounts, setAccounts] = useState<ExternalAccountProps[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase
        .from("Account")
        .select("favourite_accounts")
        .eq("customer_id", user?.customer_id);

      if (error) {
        console.error("Error fetching accounts:", error.message);
        return;
      }

      if (data) {
        const favouriteAccounts = data
          .map((item) => item.favourite_accounts)
          .flat()
          .filter((account) => account !== null)
          .map((account) => account as ExternalAccountProps);

        setAccounts(favouriteAccounts);
      }
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
      <TouchableOpacity
        style={{
          flexDirection: "row",
          gap: 15,
          alignItems: "center",
          marginTop: 20,
          marginHorizontal: 10,
          backgroundColor: isDarkMode ? Colors.dark.firstButton : "white",
          padding: 10,
          paddingLeft: 15,
          borderRadius: 20,
          elevation: 5,
          shadowColor: isDarkMode
            ? Colors.dark.themeColor
            : Colors.light.themeColor,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
        onPress={() => router.push("/(user)/(transfer)/newTransfer")}
      >
        <View
          style={{
            padding: 5,
            backgroundColor: isDarkMode
              ? Colors.dark.themeColorSecondary
              : Colors.light.themeColor,
            borderRadius: 50,
          }}
        >
          <Entypo name="plus" size={32} color="white" />
        </View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: isDarkMode ? Colors.dark.text : Colors.light.text,
          }}
        >
          New Transfer
        </Text>
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: isDarkMode ? "white" : "black",
          marginLeft: 10,
          marginTop: 30,
          marginBottom: 10,
        }}
      >
        Favourite List
      </Text>
      <Animated.FlatList
        data={accounts}
        renderItem={({ item }) => (
          <BankTab isEWBBank={false} external_account={item} />
        )}
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
        }}
      ></Animated.FlatList>
    </View>
  );
};

const styles = StyleSheet.create({});

export default TransferOthersPage;
