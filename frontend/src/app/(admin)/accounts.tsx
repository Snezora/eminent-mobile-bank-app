import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Keyboard,
} from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
  TextInput,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import fetchListofAccounts from "@/src/providers/fetchListofAccounts";
import { Account } from "@/assets/data/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/providers/AuthProvider";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import AdminAccountsBlock from "@/src/components/AdminAccountsBlock";
import { Drawer } from "react-native-drawer-layout";
import dayjs from "dayjs";
import { supabase } from "@/src/lib/supabase";
import { fetchCustomerDetails } from "@/src/providers/fetchCustomerDetails";
import Modal from "react-native-modal";

// DO MODAL FOR ACCOUNT DETAILS!!!!

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [updateTime, setUpdateTime] = useState(new Date());
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [chosenAccount, setChosenAccount] = useState<Account | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setUpdateTime(new Date());
    fetchListofAccounts({ isAdmin }).then(async (data) => {
      if (searchName) {
        //fetch customers with searchName
        const { data: customers, error } = await supabase
          .from("Customer")
          .select("*")
          .or(
            `first_name.ilike.%${searchName}%,last_name.ilike.%${searchName}%`
          );

        if (error) {
          console.error("Error fetching customers:", error);
        }

        data = data?.filter((account) =>
          customers?.some(
            (customer) => customer.customer_id === account.customer_id
          )
        );
      }

      setAccounts(data ?? []);
    });

    if (!searchName) {
      const channel = supabase
        .channel("custom-all-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "Account" },
          (payload) => {
            setLoading(true);
            fetchListofAccounts({ isAdmin }).then((data) => {
              setAccounts(data ?? []);
              setUpdateTime(new Date());
              setLoading(false);
            });
          }
        )
        .subscribe();
    }
  }, [isAdmin, searchName]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Colors.light.themeColor }}
        edges={["top"]}
      >
        <Drawer
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => {
            setOpen(false);
            //close keyboard
            Keyboard.dismiss();
          }}
          renderDrawerContent={() => {
            return (
              <ScrollView scrollEnabled={false}>
                <Text style={styles.filterTitle}>Sort & Filter</Text>
                <View style={styles.filterItem}>
                  <Text style={styles.filterSubtitle}>Customer Name</Text>
                  <View style={styles.filterContainer}>
                    <TextInput
                      style={styles.filterInput}
                      value={searchName}
                      onChangeText={(text) => setSearchName(text)}
                      placeholder="Search by customer name"
                      placeholderTextColor="#6b6b6b"
                    />
                  </View>
                </View>
                <View style={styles.filterItem}>
                  <Text style={styles.filterSubtitle}>Customer Name</Text>
                  <View style={styles.filterContainer}>
                    <TextInput
                      style={styles.filterInput}
                      value={searchName}
                      onChangeText={(text) => setSearchName(text)}
                      placeholder="Search by customer name"
                      placeholderTextColor="#6b6b6b"
                    />
                  </View>
                </View>
              </ScrollView>
            );
          }}
          drawerType="front"
          drawerPosition="right"
          drawerStyle={{
            backgroundColor: Colors.light.background,
            width: "70%",
            padding: 20,
            borderTopLeftRadius: 50,
            borderBottomLeftRadius: 50,
          }}
          overlayStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.25)",
          }}
        >
          <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingBottom: 10,
                paddingTop: 10,
                backgroundColor: Colors.light.themeColor,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <TouchableOpacity activeOpacity={0} onPress={() => router.back()}>
                <Ionicons name="chevron-back-outline" size={24} color="white" />
              </TouchableOpacity>
              <Text
                style={{ fontSize: 24, fontWeight: "bold", color: "white" }}
              >
                Accounts
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                backgroundColor: Colors.light.background,
                alignItems: "center",
                padding: 10,
              }}
            >
              <View style={{ flexDirection: "column" }}>
                <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                  Last Updated On:{" "}
                </Text>
                <Text style={{ fontSize: 14, color: Colors.light.themeColor }}>
                  {dayjs(updateTime).format("DD/MM/YYYY hh:mm:ssA")}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  padding: 10,
                  borderRadius: 10,
                  borderColor: Colors.light.themeColor,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: 10,
                  backgroundColor: Colors.light.themeColorSecondary,
                }}
                onPress={() => setOpen(true)}
              >
                <Text style={{ color: "white" }}>Filter</Text>
                <Ionicons name="filter" size={16} color={"white"}></Ionicons>
              </TouchableOpacity>
            </View>
            <View style={styles.mainContainer}>
              <Animated.FlatList
                data={accounts}
                itemLayoutAnimation={LinearTransition}
                keyExtractor={(item) => item.account_id}
                renderItem={({ item }) => (
                  <AdminAccountsBlock
                    account={item}
                    onPress={() => {
                      setChosenAccount(item);
                      setModalVisible(true);
                    }}
                  />
                )}
                ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
                refreshControl={
                  <RefreshControl
                    refreshing={loading}
                    onRefresh={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                        setUpdateTime(new Date());
                      }, 2000);
                    }}
                  />
                }
              />
            </View>
          </View>
        </Drawer>
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          style={{ backgroundColor: "white", borderRadius: 20 }}
        >
          <Text>{chosenAccount?.account_no}</Text>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: "100%",
    backgroundColor: Colors.light.background,
    borderWidth: 3,
    borderColor: Colors.light.themeColor,
    borderRadius: 10,
  },
  filterTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.light.themeColor,
  },
  filterSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "black",
  },
  filterOption: {
    color: "#6b6b6b",
    fontSize: 16,
    fontWeight: "bold",
  },
  filterInput: {
    fontSize: 14,
  },
  startEndDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  filterItem: {
    marginBottom: 20,
  },
});

export default Accounts;
