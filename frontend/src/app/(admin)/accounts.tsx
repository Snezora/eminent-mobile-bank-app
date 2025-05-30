import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Keyboard,
  ActivityIndicator,
  Alert,
  Image,
  Touchable,
} from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
  TextInput,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/src/constants/Colors";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import fetchListofAccounts from "@/src/providers/fetchListofAccounts";
import { Account, Customer } from "@/assets/data/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/providers/AuthProvider";
import Animated, {
  FadeIn,
  FadeOut,
  FadeOutRight,
  LinearTransition,
} from "react-native-reanimated";
import AdminAccountsBlock from "@/src/components/AdminAccountsBlock";
import { Drawer } from "react-native-drawer-layout";
import dayjs from "dayjs";
import { supabase } from "@/src/lib/supabase";
import { fetchCustomerDetails } from "@/src/providers/fetchCustomerDetails";
import Modal from "react-native-modal";
import Button from "@/src/components/Button";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { set } from "react-hook-form";

// DO MODAL FOR ACCOUNT DETAILS!!!!

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { isAdmin, isMockEnabled } = useAuth();
  const [open, setOpen] = useState(false);
  const [updateTime, setUpdateTime] = useState(new Date());
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [chosenAccount, setChosenAccount] = useState<Account | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [accountName, setAccountName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const accountStatus = [
    { label: "Active", value: "Active" },
    { label: "Blocked", value: "Blocked" },
    { label: "Inactive", value: "Inactive" },
    { label: "Pending", value: "Pending" },
  ];

  useEffect(() => {
    setUpdateTime(new Date());
    fetchListofAccounts({ isMockEnabled: isMockEnabled ?? false, isAdmin })
      .then(async (data) => {
        if (searchName) {
          // fetch customers with searchName
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

        let sortedAccounts = [...(data ?? [])].sort((a, b) => {
          if (!!a.approved_at === !!b.approved_at) {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          }
          // Not approved comes first
          return a.approved_at ? 1 : -1;
        });

        if (selectedStatus) {
          // filter accounts by selected status
          sortedAccounts = sortedAccounts.filter(
            (account) => account.account_status === selectedStatus
          );

          console.log("Filtered accounts by status:", selectedStatus);
        }

        if (accountName) {
          // filter accounts by account name
          sortedAccounts = sortedAccounts.filter((account) =>
            account.nickname?.toLowerCase().includes(accountName.toLowerCase())
          );
        }

        setAccounts(sortedAccounts);
      })
      .then(() => {
        setTimeout(() => {
          setPageLoading(false);
        }, 2000);
      });

    if (!searchName && !accountName) {
      const channel = supabase
        .channel("custom-all-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "Account" },
          (payload) => {
            setLoading(true);
            fetchListofAccounts({
              isMockEnabled: isMockEnabled ?? false,
              isAdmin,
            }).then((data) => {
              // Only filter if payload.new exists and accountName is not blank
              if (payload.new && payload.new.customer_id && accountName) {
                data = data?.filter(
                  (account) => account.customer_id === payload.new.customer_id
                );
              }

              let sortedAccounts = [...(data ?? [])].sort((a, b) => {
                if (!!a.approved_at === !!b.approved_at) {
                  return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                  );
                }
                // Not approved comes first
                return a.approved_at ? 1 : -1;
              });

              if (selectedStatus) {
                // Filter accounts by selected status
                sortedAccounts = sortedAccounts.filter(
                  (account) => account.account_status === selectedStatus
                );
              }

              if (accountName) {
                // Filter accounts by account name
                sortedAccounts = sortedAccounts.filter((account) =>
                  account.nickname
                    ?.toLowerCase()
                    .includes(accountName.toLowerCase())
                );
              }

              setAccounts(sortedAccounts);
              setUpdateTime(new Date());
              setLoading(false);
              setPageLoading(false);
            });
          }
        )
        .subscribe();
    }
  }, [isAdmin, searchName, accountName, selectedStatus]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Colors.light.themeColor }}
        edges={["top"]}
      >
        {pageLoading && (
          <Animated.View
            exiting={FadeOut.duration(1000)}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Colors.light.background,
            }}
          >
            <ActivityIndicator
              size="large"
              color={Colors.light.themeColor}
              style={{ marginBottom: 20 }}
            />
          </Animated.View>
        )}
        {!pageLoading && (
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
                <>
                  <ScrollView scrollEnabled={false}>
                    <Text style={styles.filterTitle}>Sort & Filter</Text>
                    <Text style={styles.filterSubtitle}>Search By:</Text>
                    <View style={styles.filterItem}>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={styles.filterOption}>Customer Name</Text>
                        {searchName && (
                          <TouchableOpacity
                            onPress={() => {
                              setSearchName("");
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 16,
                                color: Colors.light.themeColor,
                                fontWeight: "bold",
                              }}
                            >
                              Clear
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

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
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={styles.filterOption}>Account Name</Text>
                        {accountName && (
                          <TouchableOpacity
                            onPress={() => {
                              setAccountName("");
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 16,
                                color: Colors.light.themeColor,
                                fontWeight: "bold",
                              }}
                            >
                              Clear
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.filterContainer}>
                        <TextInput
                          style={styles.filterInput}
                          value={accountName}
                          onChangeText={(text) => setAccountName(text)}
                          placeholder="Search by account name"
                          placeholderTextColor="#6b6b6b"
                        />
                      </View>
                    </View>
                    <Text style={styles.filterSubtitle}>Filter By:</Text>
                    <View style={styles.filterItem}>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={styles.filterOption}>Account Status</Text>
                        {selectedStatus && (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedStatus("");
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 16,
                                color: Colors.light.themeColor,
                                fontWeight: "bold",
                              }}
                            >
                              Clear
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.filterContainer}>
                        <Dropdown
                          value={selectedStatus}
                          onChange={(value) => {
                            setSelectedStatus(value.value);
                          }}
                          data={accountStatus}
                          placeholder="Search by account status"
                          placeholderStyle={{
                            color: "#6b6b6b",
                            fontSize: 14,
                          }}
                          labelField={"label"}
                          valueField={"value"}
                        />
                      </View>
                    </View>
                  </ScrollView>
                  <View style={{ gap: 20 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        justifyContent: "space-evenly",
                      }}
                    >
                      <Button
                        label="Clear"
                        onClick={() => {
                          setOpen(false);
                          setSearchName("");
                          setAccountName("");
                          setSelectedStatus("");
                        }}
                        type="reject"
                      />
                      <Button
                        label="Filter"
                        onClick={() => {
                          setOpen(false);
                        }}
                        type="default"
                      />
                    </View>
                  </View>
                </>
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
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0}
                    onPress={() => router.back()}
                  >
                    <Ionicons
                      name="chevron-back-outline"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                  <Text
                    style={{ fontSize: 24, fontWeight: "bold", color: "white" }}
                  >
                    Accounts
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/(admin)/addAccount")}
                >
                  <FontAwesome
                    name="plus-square"
                    size={28}
                    color="white"
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
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
                  <Text
                    style={{ fontSize: 14, color: Colors.light.themeColor }}
                  >
                    {dayjs(updateTime).format("DD/MM/YYYY HH:mm:ss")}
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
              <View
                style={{ borderColor: Colors.light.themeColor, borderWidth: 1 }}
              ></View>
              {accounts.length === 0 && !loading && (
                <Animated.View
                  exiting={FadeOut.duration(1000)}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: Colors.light.background,
                  }}
                >
                  <Image
                    source={require("@/assets/images/laptop.gif")}
                    style={{ width: 150, height: 150 }}
                  />
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    No accounts found
                  </Text>
                </Animated.View>
              )}
              <View style={styles.mainContainer}>
                <Animated.FlatList
                  data={accounts}
                  itemLayoutAnimation={LinearTransition}
                  keyExtractor={(item) => item.account_id}
                  renderItem={({ item, index }) => {
                    const prevItem = index > 0 ? accounts[index - 1] : null;
                    const showSeparator =
                      index === 0 ||
                      (prevItem &&
                        !!prevItem.approved_at !== !!item.approved_at);

                    return (
                      <>
                        {showSeparator && (
                          <View
                            style={{
                              backgroundColor: item.approved_at
                                ? "green"
                                : Colors.light.themeColorReject,
                              marginBottom: 20,
                              paddingVertical: 5,
                              width: "40%",
                              alignSelf: "center",
                              borderRadius: 30,
                              borderWidth: 4,
                              borderColor: item.approved_at
                                ? "green"
                                : Colors.light.themeColorReject,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "bold",
                                textAlign: "center",
                                color: "white",
                              }}
                            >
                              {item.approved_at ? "Approved" : "Not Approved"}
                            </Text>
                          </View>
                        )}
                        <AdminAccountsBlock
                          account={item}
                          // onPress={() => {
                          //   setChosenAccount(item);
                          //   fetchCustomerDetails(item.customer_id).then(
                          //     (details) => {
                          //       setCustomerDetails(details);
                          //     }
                          //   );
                          //   setModalVisible(true);
                          // }}
                          onPress={() => {
                            setChosenAccount(item); // Set chosenAccount immediately
                            // Fetch customer details
                            fetchCustomerDetails(
                              isMockEnabled ?? false,
                              item.customer_id
                            )
                              .then((details) => {
                                setCustomerDetails(details); // Set customer details
                                setModalVisible(true); // ONLY show modal AFTER both are set
                              })
                              .catch((error) => {
                                console.error(
                                  "Error fetching customer details for modal:",
                                  error
                                );
                                // Optionally, show an alert or handle the error gracefully
                                Alert.alert(
                                  "Error",
                                  "Could not load account details."
                                );
                              });
                          }}
                        />
                      </>
                    );
                  }}
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
        )}

        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          style={{
            justifyContent: "center",
          }}
          hideModalContentWhileAnimating
          useNativeDriver={false}
          backdropTransitionOutTiming={1}
          animationIn={"slideInUp"}
          animationOut={"slideOutDown"}
        >
          <View
            style={{ backgroundColor: "white", borderRadius: 20, padding: 20 }}
          >
            <Text style={[styles.filterTitle, { fontSize: 20 }]}>
              Account Details
            </Text>
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Account Number: </Text>
              <Text style={styles.normalText}>{chosenAccount?.account_no}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Account Name: </Text>
              <Text style={styles.normalText}>
                {chosenAccount?.nickname ?? "N/A"}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Account Holder: </Text>
              <Text style={styles.normalText}>
                {customerDetails?.first_name ?? "N/A"}{" "}
                {customerDetails?.last_name ?? "N/A"}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Account Status: </Text>
              <Text style={styles.normalText}>
                {chosenAccount?.account_status ?? "N/A"}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Account Type: </Text>
              <Text style={styles.normalText}>
                {chosenAccount?.account_type ?? "N/A"}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Account Balance: </Text>
              <Text style={styles.normalText}>
                USD {chosenAccount?.balance.toFixed(2) ?? "N/A"}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>Created On: </Text>
              <Text style={styles.normalText}>
                {dayjs(chosenAccount?.created_at).format("DD/MM/YYYY")}
              </Text>
            </View>
            {!chosenAccount?.approved_at && (
              <>
                <View style={styles.textContainer}>
                  <Text style={styles.nameText}>Approval Status: </Text>
                  <Text style={styles.normalText}>Not Approved</Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: "green",
                    padding: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    marginTop: 10,
                  }}
                  onPress={() => {
                    Alert.alert(
                      "Confirm Approval",
                      "Are you sure you want to approve this account?",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Approve",
                          onPress: async () => {
                            setModalVisible(false);
                            const { error } = await supabase
                              .from("Account")
                              .update({
                                approved_at: dayjs().toISOString(),
                                account_status: "Active",
                              })
                              .eq("account_id", chosenAccount?.account_id);
                            if (error) {
                              console.error("Error blocking account:", error);
                            }
                          },
                        },
                      ],
                      { cancelable: false }
                    );
                  }}
                >
                  <Text style={{ color: "white" }}>Approve Account</Text>
                </TouchableOpacity>
              </>
            )}

            {chosenAccount?.approved_at && (
              <>
                <View style={styles.textContainer}>
                  <Text style={styles.nameText}>Approved On: </Text>
                  <Text style={styles.normalText}>
                    {dayjs(chosenAccount?.approved_at).format("DD/MM/YYYY")}
                  </Text>
                </View>
                <View style={{ gap: 10 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: Colors.light.themeColor,
                      padding: 10,
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      setModalVisible(false);
                      router.replace({
                        pathname: "/(admin)/transfers",
                        params: { searchIDExternal: chosenAccount?.account_no },
                      });
                    }}
                  >
                    <Text style={{ color: "white" }}>View Transfers</Text>
                  </TouchableOpacity>
                  {chosenAccount?.account_status !== "Blocked" && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: Colors.light.themeColorReject,
                        padding: 10,
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                      onPress={() => {
                        Alert.alert(
                          "Confirm Block",
                          "Are you sure you want to block this account?",
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                            },
                            {
                              text: "Block",
                              onPress: async () => {
                                setModalVisible(false);
                                const { error } = await supabase
                                  .from("Account")
                                  .update({
                                    account_status: "Blocked",
                                  })
                                  .eq("account_id", chosenAccount?.account_id);
                                if (error) {
                                  console.error(
                                    "Error blocking account:",
                                    error
                                  );
                                }
                              },
                            },
                          ],
                          { cancelable: false }
                        );
                      }}
                    >
                      <Text style={{ color: "white" }}>Block Account</Text>
                    </TouchableOpacity>
                  )}
                  {chosenAccount?.account_status == "Blocked" && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: Colors.light.themeColor,
                        padding: 10,
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                      onPress={() => {
                        Alert.alert(
                          "Confirm Unblock",
                          "Are you sure you want to unblock this account?",
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                            },
                            {
                              text: "Unblock",
                              onPress: async () => {
                                setModalVisible(false);
                                const { error } = await supabase
                                  .from("Account")
                                  .update({
                                    account_status: "Active",
                                  })
                                  .eq("account_id", chosenAccount?.account_id);
                                if (error) {
                                  console.error(
                                    "Error blocking account:",
                                    error
                                  );
                                }
                              },
                            },
                          ],
                          { cancelable: false }
                        );
                      }}
                    >
                      <Text style={{ color: "white" }}>Unblock Account</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  filterOption: {
    color: "#6b6b6b",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
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
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
    marginBottom: 10,
  },
  normalText: {
    fontSize: 15,
  },
});

export default Accounts;
