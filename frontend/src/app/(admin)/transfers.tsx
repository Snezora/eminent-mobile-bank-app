import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  ScrollView,
  ViewStyle,
  Dimensions,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { transactions } from "@/assets/data/dummyTransactions";
import AdminTransfersBlock from "@/src/components/AdminTransfersBlock";
import Colors from "@/src/constants/Colors";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "react-native-drawer-layout";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { Transaction } from "@/assets/data/types";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { DateSort, DateSortComponent } from "@/src/components/DateSort";
import Button from "@/src/components/Button";
import Animated, {
  FadeOut,
  LinearTransition,
  SequencedTransition,
  SlideInLeft,
} from "react-native-reanimated";
import fetchListofTransactions from "@/src/providers/fetchListofTransactions";
import { useAuth } from "@/src/providers/AuthProvider";
import { supabase } from "@/src/lib/supabase";
import { useLocalSearchParams } from "expo-router";

const dateSort = [
  { label: "Ascending", value: "ascending" },
  { label: "Descending", value: "descending" },
];

const transferTypes = [
  { label: "IBG", value: "IBG" },
  { label: "FPX", value: "FPX" },
  { label: "DuitNow", value: "DuitNow" },
  { label: "Instant Transfer", value: "Instant Transfer" },
];

const TransferAdminPage = () => {
  const { searchIDExternal } = useLocalSearchParams();
  // Now you can use searchIDExternal in your logic

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [open, setOpen] = useState(false);
  const [dateOrder, setDateOrder] = useState("descending");
  const [loading, setLoading] = useState(false);
  const [newTransactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransferTypes, setTransferTypes] = useState<string[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [updateTime, setUpdateTime] = useState(new Date());
  const { isAdmin, isMockEnabled } = useAuth();
  const [searchID, setSearchID] = useState(searchIDExternal || "");
  const [pageLoading, setPageLoading] = useState(true);

  const isBetween = require("dayjs/plugin/isBetween");
  dayjs.extend(isBetween);
  const deviceWidth = Dimensions.get("window").width;

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

  useEffect(() => {
    const fetchTransactions = async () => {
      setPageLoading(true);
      const result = await fetchListofTransactions({
        isMockEnabled: !!isMockEnabled,
        isAdmin: !!isAdmin,
      });

      if (result && Array.isArray(result)) {
        setTransactions(result);
      }

      setPageLoading(false);
    };

    fetchTransactions();
  }, [isMockEnabled, isAdmin]);

  const fetchAndFilterTransactions = async () => {
    let filtered: Transaction[] = [];
    const result = await fetchListofTransactions({
      isMockEnabled: !!isMockEnabled,
      isAdmin: !!isAdmin,
    });
    if (result && Array.isArray(result)) {
      filtered = result;
    }

    if (selectedTransferTypes.length > 0) {
      filtered = filtered.filter((transaction) => {
        return selectedTransferTypes.includes(
          transaction.type_of_transfer ?? ""
        );
      });
    }

    if (startDate && endDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = dayjs(transaction.transfer_datetime);
        return dayjs(transactionDate).isBetween(
          startDate,
          endDate,
          "day",
          "[]"
        );
      });
    }

    filtered = DateSort(dateOrder, filtered);

    if (searchID) {
      const { data: account, error } = await supabase
        .from("Account")
        .select("account_id, account_no")
        .eq("account_no", searchID)
        .single();

      const accountId = account?.account_id ?? null;

      filtered = filtered.filter((transaction) => {
        const initiatorMatch =
          accountId && transaction.initiator_account_id === accountId;
        const receiverMatch =
          transaction.receiver_account_no &&
          transaction.receiver_account_no === searchID;

        return initiatorMatch ?? receiverMatch;
      });
    }

    setTransactions(filtered);
  };

  useEffect(() => {
    fetchAndFilterTransactions().then(() => setPageLoading(false));
  }, [dateOrder, selectedTransferTypes, startDate, endDate, searchID]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Colors.light.themeColor }}
        edges={["top"]}
      >
        <Drawer
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          renderDrawerContent={() => {
            return (
              <View
                style={[
                  styles.filterContainer,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(60, 60, 60, 1)"
                      : Colors.light.background,
                    flex: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterTitle,
                    {
                      color: isDarkMode
                        ? Colors.dark.themeColorTertiary
                        : Colors.light.themeColor,
                    },
                  ]}
                >
                  Sort & Filter
                </Text>
                <ScrollView style={{ height: "80%" }}>
                  <Text style={[styles.filterSubtitle, filterSubtitleStyle]}>
                    Sort
                  </Text>
                  <Text style={[styles.filterOption, filterOptionStyle]}>
                    Date Order
                  </Text>
                  <DateSortComponent
                    dateOrder={dateOrder}
                    setDateOrder={setDateOrder}
                  />
                  <Text
                    style={[
                      styles.filterSubtitle,
                      { marginTop: 10 },
                      filterSubtitleStyle,
                    ]}
                  >
                    Filter by
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[styles.filterOption, filterOptionStyle]}>
                      Transfer Type
                    </Text>
                    {selectedTransferTypes.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setTransferTypes([]);
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            fontSize: 16,
                            color: isDarkMode ? Colors.dark.themeColorTertiary : Colors.light.themeColor,
                            fontWeight: "bold",
                          }}
                        >
                          Clear
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <MultiSelect
                    value={selectedTransferTypes}
                    data={transferTypes}
                    labelField={"label"}
                    valueField={"value"}
                    onChange={(item) => setTransferTypes(item)}
                    containerStyle={{
                      marginBottom: 20,
                      borderRadius: 10,
                      backgroundColor: "white",
                      padding: 10,
                    }}
                    style={{
                      borderRadius: 10,
                      backgroundColor: "white",
                      padding: 10,
                      borderColor: "black",
                      borderWidth: 1,
                      marginTop: 10,
                    }}
                    renderSelectedItem={(item, unSelect) => {
                      return (
                        <TouchableOpacity
                          onPress={() => unSelect && unSelect(item)}
                        >
                          <View
                            style={{
                              padding: 10,
                              borderRadius: 10,
                              borderColor: "black",
                              borderWidth: 1,
                              backgroundColor: "white",
                              marginTop: 8,
                              marginRight: 12,
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <Text>{item.label}</Text>
                            <AntDesign
                              name="closecircleo"
                              size={17}
                              color="black"
                            />
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 20,
                    }}
                  >
                    <Text style={[styles.filterOption, filterOptionStyle]}>
                      Date Range
                    </Text>
                    {(endDate || startDate) && (
                      <TouchableOpacity
                        onPress={() => {
                          setStartDate(null);
                          setEndDate(null);
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            fontSize: 16,
                            color: isDarkMode ? Colors.dark.themeColorTertiary : Colors.light.themeColor,
                            fontWeight: "bold",
                          }}
                        >
                          Clear
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.startEndDateContainer}>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(true)}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 10,
                        borderColor: "black",
                        borderWidth: 1,
                        width: "40%",
                      }}
                    >
                      <Text
                        style={[
                          {
                            textAlign: "center",
                            fontSize: 16,
                            paddingVertical: 10,
                            color: Colors.light.themeColor,
                            fontWeight: "bold",
                          },
                        ]}
                      >
                        {startDate
                          ? dayjs(startDate).format("DD/MM/YY")
                          : "Start Date"}
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 20,
                        color: isDarkMode ? "white" : "black",
                      }}
                    >
                      -
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowEndDatePicker(true)}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 10,
                        borderColor: "black",
                        borderWidth: 1,
                        width: "40%",
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 16,
                          paddingVertical: 10,
                          color: Colors.light.themeColor,
                          fontWeight: "bold",
                        }}
                      >
                        {endDate
                          ? dayjs(endDate).format("DD/MM/YY")
                          : "End Date"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* Don't mind these two date time picker modals, they're just here! */}
                  <DateTimePickerModal
                    isVisible={showStartDatePicker}
                    mode="date"
                    date={startDate ?? new Date()}
                    onConfirm={(date) => {
                      setShowStartDatePicker(false);
                      setStartDate(date);
                    }}
                    onCancel={() => {
                      setShowStartDatePicker(false);
                    }}
                    maximumDate={endDate ?? new Date()}
                    pickerStyleIOS={{
                      width: deviceWidth,
                      padding: 0,
                      margin: 0,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  />
                  <DateTimePickerModal
                    isVisible={showEndDatePicker}
                    mode="date"
                    date={endDate ?? new Date()}
                    onConfirm={(date) => {
                      setShowEndDatePicker(false);
                      setEndDate(date);
                    }}
                    onCancel={() => {
                      setShowEndDatePicker(false);
                    }}
                    minimumDate={startDate ?? new Date(0)}
                    maximumDate={new Date()}
                    pickerStyleIOS={{
                      width: deviceWidth,
                      padding: 0,
                      margin: 0,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  />

                  {/* Account ID */}
                  <Text
                    style={[
                      styles.filterSubtitle,
                      { marginTop: 10, marginBottom: 10 },
                      filterSubtitleStyle,
                    ]}
                  >
                    Search by Account
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={[styles.filterOption, filterOptionStyle]}>
                        Initiator Account ID
                      </Text>
                      {searchID && (
                        <TouchableOpacity
                          onPress={() => {
                            setSearchID("");
                          }}
                        >
                        <Text
                          style={{
                            textAlign: "center",
                            fontSize: 16,
                            color: isDarkMode ? Colors.dark.themeColorTertiary : Colors.light.themeColor,
                            fontWeight: "bold",
                          }}
                        >
                          Clear
                        </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.filterTextContainer}>
                      <TextInput
                        style={styles.filterInput}
                        value={searchID}
                        onChangeText={(text) => setSearchID(text)}
                        placeholder="Search by Account ID"
                        placeholderTextColor="#6b6b6b"
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDarkMode ? "white" : "#6b6b6b",
                        marginTop: 5,
                        textAlign: "justify",
                        marginHorizontal: 5,
                      }}
                    >
                      *Note: It is recommended to search through Accounts
                    </Text>
                  </View>
                </ScrollView>
                <View style={{ gap: 20 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDarkMode ? "white" : "#6b6b6b",
                    }}
                  >
                    *Note: The date range filter will only work if both dates
                    are selected.
                  </Text>
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
                        setStartDate(null);
                        setEndDate(null);
                        setTransferTypes([]);
                        setSearchID("");
                        setDateOrder("ascending");
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
              </View>
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
            backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.25)",
          }}
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
            <>
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
                  Transfers
                </Text>
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
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: isDarkMode ? "white" : Colors.light.themeColor }}>
                    Last Updated On:{" "}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: isDarkMode ? "white" : Colors.light.themeColor }}
                  >
                    {dayjs(updateTime).format("DD/MM/YYYY HH:mm:ss")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    borderColor: isDarkMode ? "white" : Colors.light.themeColor,
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
              {!newTransactions.length && (
                <View
                  style={{
                    flex: 1,
                    // justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
                    paddingTop: 100,
                  }}
                >
                  <Image
                    source={require("@/assets/images/laptop.gif")}
                    style={{ width: 150, height: 150 }}
                  />
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: isDarkMode ? "white" : Colors.light.themeColor }}>
                    No transactions found
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setOpen(true);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: Colors.light.themeColorSecondary,
                        textDecorationLine: "underline",
                        fontWeight: "bold",
                        marginTop: 10,
                      }}
                    >
                      Filter Again
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {newTransactions.length > 0 && (
                <Animated.FlatList
                  data={newTransactions}
                  renderItem={({ item, index }) => {
                    const prevItem =
                      index > 0 ? newTransactions[index - 1] : null;
                    const showSeparator =
                      index === 0 ||
                      (prevItem &&
                        dayjs(prevItem.transfer_datetime).format(
                          "YYYY-MM-DD"
                        ) !==
                          dayjs(item.transfer_datetime).format("YYYY-MM-DD"));

                    return (
                      <>
                        {showSeparator && (
                          <View
                            style={{
                              backgroundColor: Colors.light.themeColorAccent,
                              marginBottom: 20,
                              paddingVertical: 5,
                              width: "30%",
                              alignSelf: "center",
                              borderRadius: 30,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              {dayjs(item.transfer_datetime).isSame(
                                dayjs(),
                                "date"
                              )
                                ? "Today"
                                : dayjs(item.transfer_datetime).format(
                                    "DD MMMM YYYY"
                                  )}
                            </Text>
                          </View>
                        )}
                        <AdminTransfersBlock {...item} />
                      </>
                    );
                  }}
                  keyExtractor={(item) => item.transaction_id}
                  style={{
                    paddingVertical: 10,
                    backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
                  }}
                  contentContainerStyle={{
                    paddingVertical: 10,
                    paddingBottom: 40,
                  }}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
                  itemLayoutAnimation={LinearTransition}
                  onLayout={() => {
                    setTimeout(() => {
                      setLoading(false);
                    }, 2000);
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={loading}
                      onRefresh={() => {
                        setLoading(true);
                        setTimeout(() => {
                          fetchAndFilterTransactions();
                          setLoading(false);
                          setUpdateTime(new Date());
                        }, 2000);
                      }}
                    />
                  }
                />
              )}
            </>
          )}
        </Drawer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 10,
    width: "100%",
    backgroundColor: Colors.light.background,
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
  },
  startEndDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  filterInput: {
    fontSize: 14,
  },
  filterTextContainer: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    width: "100%",
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default TransferAdminPage;
