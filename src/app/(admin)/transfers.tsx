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

const dateSort = [
  { label: "Ascending", value: "ascending" },
  { label: "Descending", value: "descending" },
];

const transferTypes = [
  { label: "IBG", value: "IBG" },
  { label: "FPX", value: "FPX" },
  { label: "DuitNow", value: "DuitNow" },
  { label: "Instant Transfer", value: "Instant Transfer" },
  { label: "Internal Transfer", value: "Internal Transfer" },
  { label: "Cash Deposit", value: "Cash Deposit" },
];

const TransferAdminPage = () => {
  const colorScheme = useColorScheme();
  const [open, setOpen] = useState(false);
  const [dateOrder, setDateOrder] = useState("ascending");
  const [loading, setLoading] = useState(false);
  const [newTransactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransferTypes, setTransferTypes] = useState<string[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [updateTime, setUpdateTime] = useState(new Date());

  const isBetween = require("dayjs/plugin/isBetween");
  dayjs.extend(isBetween);
  const deviceWidth = Dimensions.get("window").width; //full width

  useEffect(() => {
    let filtered = transactions;

    if (selectedTransferTypes.length > 0) {
      filtered = transactions.filter((transaction) => {
        return selectedTransferTypes.includes(
          transaction.type_of_transfer ?? ""
        );
      });

      setTransactions(filtered);
    }

    if (startDate && endDate) {
      filtered = transactions.filter((transaction) => {
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

    setTransactions(filtered);
  }, [dateOrder, selectedTransferTypes, startDate, endDate]);

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
              <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Sort & Filter</Text>
                <ScrollView style={{ height: "80%" }}>
                  <Text style={styles.filterSubtitle}>Sort</Text>
                  <Text style={styles.filterOption}>Date Order</Text>
                  <DateSortComponent
                    dateOrder={dateOrder}
                    setDateOrder={setDateOrder}
                  />
                  <Text style={[styles.filterSubtitle, { marginTop: 10 }]}>
                    Filter by
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.filterOption}>Transfer Type</Text>
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
                            color: Colors.light.themeColor,
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
                    <Text style={[styles.filterOption]}>Date Range</Text>
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
                            color: Colors.light.themeColor,
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
                        style={{
                          textAlign: "center",
                          fontSize: 16,
                          paddingVertical: 10,
                          color: Colors.light.themeColor,
                          fontWeight: "bold",
                        }}
                      >
                        {startDate
                          ? dayjs(startDate).format("DD/MM/YY")
                          : "Start Date"}
                      </Text>
                    </TouchableOpacity>

                    <Text style={{ fontWeight: "bold", fontSize: 20 }}>-</Text>
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
                </ScrollView>
                <View style={{ gap: 20 }}>
                  <Text style={{ fontSize: 12, color: "#6b6b6b" }}>
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
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
              Transfers
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
          {!newTransactions.length && (
            <View
              style={{
                flex: 1,
                // justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.light.background,
                paddingTop: 100,
              }}
            >
              <Image
                source={require("@/assets/images/laptop.gif")}
                style={{ width: 150, height: 150 }}
              />
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
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
            <FlatList
              data={newTransactions}
              // renderItem={({ item }) => <AdminTransfersBlock {...item} />}
              renderItem={({ item, index }) => {
                const prevItem = index > 0 ? newTransactions[index - 1] : null;
                const showSeparator =
                  index === 0 ||
                  (prevItem &&
                    dayjs(prevItem.transfer_datetime).format("YYYY-MM-DD") !==
                      dayjs(item.transfer_datetime).format("YYYY-MM-DD"));

                return (
                  <>
                    {showSeparator && (
                      <View
                        style={{
                          backgroundColor: Colors.light.themeColorAccent,
                          marginBottom: 20,
                          paddingVertical: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          {dayjs(item.transfer_datetime).isSame(dayjs(), "date")
                            ? "Today"
                            : dayjs(item.transfer_datetime).format(
                                "DD MMMM YYYY"
                              )}
                          {/* {dayjs(item.transfer_datetime).format("DD MMMM YYYY")} */}
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
                backgroundColor: Colors.light.background,
              }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
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
});

export default TransferAdminPage;
