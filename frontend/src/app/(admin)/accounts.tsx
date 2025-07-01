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
  useColorScheme,
  Dimensions,
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
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/src/providers/AuthProvider";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import AdminAccountsBlock from "@/src/components/AdminAccountsBlock";
import { Drawer } from "react-native-drawer-layout";
import Modal from "react-native-modal";
import dayjs from "dayjs";
import { supabase } from "@/src/lib/supabase";
import { fetchCustomerDetails } from "@/src/providers/fetchCustomerDetails";
import Button from "@/src/components/Button";
import { Dropdown } from "react-native-element-dropdown";
import { useRealtimeSubscription } from "@/src/lib/useRealTimeSubscription";

const { width, height } = Dimensions.get("window");

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
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const filterSubtitleStyle = isDarkMode
    ? {
        color: Colors.dark.themeColorTertiary,
      }
    : {
        color: Colors.light.themeColor,
      };

  const filterOptionStyle = isDarkMode
    ? {
        color: Colors.light.background,
      }
    : {
        color: "#6b6b6b",
      };

  const accountStatus = [
    { label: "Active", value: "Active" },
    { label: "Blocked", value: "Blocked" },
    { label: "Inactive", value: "Inactive" },
    { label: "Pending", value: "Pending" },
  ];

  const fetchAndFilterAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchListofAccounts({
        isMockEnabled: isMockEnabled ?? false,
        isAdmin,
      });

      if (!data) {
        setAccounts([]);
        return;
      }

      let filteredData = [...data];

      if (searchName) {
        const { data: customers, error } = await supabase
          .from("Customer")
          .select("*")
          .or(
            `first_name.ilike.%${searchName}%,last_name.ilike.%${searchName}%`
          );

        if (error) {
          console.error("Error fetching customers:", error);
        } else {
          filteredData = filteredData.filter((account) =>
            customers?.some(
              (customer) => customer.customer_id === account.customer_id
            )
          );
        }
      }

      let sortedAccounts = filteredData.sort((a, b) => {
        if (
          (a.account_status === "Pending") !==
          (b.account_status === "Pending")
        ) {
          return a.account_status === "Pending" ? -1 : 1;
        }
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      if (selectedStatus) {
        sortedAccounts = sortedAccounts.filter(
          (account) => account.account_status === selectedStatus
        );
      }

      if (accountName) {
        sortedAccounts = sortedAccounts.filter((account) =>
          account.nickname?.toLowerCase().includes(accountName.toLowerCase())
        );
      }

      setAccounts(sortedAccounts);
      setUpdateTime(new Date());
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [isAdmin, isMockEnabled, searchName, accountName, selectedStatus]);

  const handleAccountChange = useCallback(
    (payload: any) => {
      console.log("Account change received:", payload);
      fetchAndFilterAccounts();
    },
    [fetchAndFilterAccounts]
  );

  useRealtimeSubscription("Account", handleAccountChange, "*", true);

  useEffect(() => {
    fetchAndFilterAccounts();
  }, [fetchAndFilterAccounts]);

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
              backgroundColor: isDarkMode
                ? Colors.dark.background
                : Colors.light.background,
            }}
          >
            <ActivityIndicator
              size="large"
              color={isDarkMode ? "white" : Colors.light.themeColor}
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
                    <Text
                      style={[
                        styles.filterTitle,
                        {
                          color: isDarkMode
                            ? Colors.dark.themeColorTertiary
                            : Colors.dark.themeColor,
                        },
                      ]}
                    >
                      Sort & Filter
                    </Text>
                    <Text style={[styles.filterSubtitle, filterSubtitleStyle]}>
                      Search By:
                    </Text>
                    <View style={styles.filterItem}>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={[styles.filterOption, filterOptionStyle]}>
                          Customer Name
                        </Text>
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
                        <Text style={[styles.filterOption, filterOptionStyle]}>
                          Account Name
                        </Text>
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
                    <Text style={[styles.filterSubtitle, filterSubtitleStyle]}>
                      Filter By:
                    </Text>
                    <View style={styles.filterItem}>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={[styles.filterOption, filterOptionStyle]}>
                          Account Status
                        </Text>
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
              backgroundColor: isDarkMode
                ? "rgba(60, 60, 60, 1)" // Black background with a subtle white overlay
                : Colors.light.background,
              width: "70%",
              padding: 20,
              borderTopLeftRadius: 50,
              borderBottomLeftRadius: 50,
            }}
            overlayStyle={{
              backgroundColor: isDarkMode
                ? "rgba(0, 0, 0, 0.5)"
                : "rgba(0, 0, 0, 0.25)",
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: isDarkMode
                  ? Colors.dark.background
                  : Colors.light.background,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingBottom: 10,
                  paddingTop: 10,
                  backgroundColor: isDarkMode
                    ? Colors.dark.themeColor
                    : Colors.light.themeColor,
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
                  backgroundColor: isDarkMode
                    ? Colors.dark.background
                    : Colors.light.background,
                  alignItems: "center",
                  padding: 10,
                }}
              >
                <View style={{ flexDirection: "column" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: isDarkMode ? "white" : Colors.light.themeColor,
                    }}
                  >
                    Last Updated On:{" "}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDarkMode ? "white" : Colors.light.themeColor,
                    }}
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
                    backgroundColor: isDarkMode
                      ? Colors.dark.background
                      : Colors.light.background,
                  }}
                >
                  <Image
                    source={require("@/assets/images/laptop.gif")}
                    style={{ width: 150, height: 150 }}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: isDarkMode ? "white" : Colors.light.themeColor,
                    }}
                  >
                    No accounts found
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: isDarkMode
                        ? Colors.dark.themeColorTertiary
                        : Colors.light.themeColorSecondary,
                      marginTop: 10,
                    }}
                  >
                    Try changing the filters or adding a new account.
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
                        (prevItem.account_status === "Pending") !==
                          (item.account_status === "Pending"));

                    return (
                      <>
                        {showSeparator && (
                          <View
                            style={{
                              backgroundColor:
                                item.account_status === "Pending"
                                  ? Colors.light.themeColorReject
                                  : "green",
                              marginBottom: 20,
                              paddingVertical: 5,
                              width: "40%",
                              alignSelf: "center",
                              borderRadius: 30,
                              borderWidth: 4,
                              borderColor:
                                item.account_status === "Pending"
                                  ? Colors.light.themeColorReject
                                  : "green",
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
                              {item.account_status === "Pending"
                                ? "Not Approved"
                                : "Approved"}
                            </Text>
                          </View>
                        )}
                        <AdminAccountsBlock
                          account={item}
                          onPress={() => {
                            setChosenAccount(item);
                            fetchCustomerDetails(
                              isMockEnabled ?? false,
                              item.customer_id
                            )
                              .then((details) => {
                                setCustomerDetails(details);
                                setModalVisible(true);
                              })
                              .catch((error) => {
                                console.error(
                                  "Error fetching customer details for modal:",
                                  error
                                );
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
                  style={{
                    backgroundColor: isDarkMode ? "#121212" : "white",
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: 5,
                    borderColor: isDarkMode ? Colors.dark.themeColor : "white",
                  }}
                >
                  <Text
                    style={[
                      styles.filterTitle,
                      {
                        fontSize: 20,
                        color: isDarkMode
                          ? Colors.dark.themeColorTertiary
                          : Colors.light.themeColor,
                      },
                    ]}
                  >
                    Account Details
                  </Text>
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.nameText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      Account Number:{" "}
                    </Text>
                    <Text
                      style={[
                        styles.normalText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      {chosenAccount?.account_no}
                    </Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.nameText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      Account Name:{" "}
                    </Text>
                    <Text
                      style={[
                        styles.normalText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      {chosenAccount?.nickname ?? "N/A"}
                    </Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.nameText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      Account Holder:{" "}
                    </Text>
                    <Text
                      style={[
                        styles.normalText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      {customerDetails?.first_name ?? "N/A"}{" "}
                      {customerDetails?.last_name ?? "N/A"}
                    </Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.nameText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      Account Status:{" "}
                    </Text>
                    <Text
                      style={[
                        styles.normalText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      {chosenAccount?.account_status ?? "N/A"}
                    </Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.nameText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      Account Type:{" "}
                    </Text>
                    <Text
                      style={[
                        styles.normalText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      {chosenAccount?.account_type ?? "N/A"}
                    </Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.nameText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      Account Balance:{" "}
                    </Text>
                    <Text
                      style={[
                        styles.normalText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      USD {chosenAccount?.balance.toFixed(2) ?? "N/A"}
                    </Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.nameText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      Created On:{" "}
                    </Text>
                    <Text
                      style={[
                        styles.normalText,
                        { color: isDarkMode ? Colors.dark.text : "#000" },
                      ]}
                    >
                      {dayjs(chosenAccount?.created_at).format("DD/MM/YYYY")}
                    </Text>
                  </View>
                  {chosenAccount?.account_status === "Pending" && (
                    <>
                      <View style={styles.textContainer}>
                        <Text
                          style={[
                            styles.nameText,
                            { color: isDarkMode ? Colors.dark.text : "#000" },
                          ]}
                        >
                          Approval Status:{" "}
                        </Text>
                        <Text
                          style={[
                            styles.normalText,
                            { color: isDarkMode ? Colors.dark.text : "#000" },
                          ]}
                        >
                          Not Approved
                        </Text>
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
                                    .eq(
                                      "account_id",
                                      chosenAccount?.account_id
                                    );
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
                        <Text style={{ color: "white" }}>Approve Account</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {chosenAccount?.account_status !== "Pending" && (
                    <>
                      <View style={styles.textContainer}>
                        <Text style={[styles.nameText, { color: "white"}]}>Approved On: </Text>
                        <Text style={[styles.normalText, { color: "white" }]}>
                          {dayjs(chosenAccount?.approved_at).format(
                            "DD/MM/YYYY"
                          )}
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
                              params: {
                                searchIDExternal: chosenAccount?.account_no,
                              },
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
                                        .eq(
                                          "account_id",
                                          chosenAccount?.account_id
                                        );
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
                            <Text style={{ color: "white" }}>
                              Block Account
                            </Text>
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
                                        .eq(
                                          "account_id",
                                          chosenAccount?.account_id
                                        );
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
                            <Text style={{ color: "white" }}>
                              Unblock Account
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </>
                  )}
                </View>
              </Modal>
            </View>
          </Drawer>
        )}
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
  modal: {
    justifyContent: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  approveButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Accounts;
