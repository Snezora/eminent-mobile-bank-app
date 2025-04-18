import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  ScrollView,
  Button,
  ViewStyle,
  Dimensions,
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

    if (dateOrder === "ascending") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.transfer_datetime).getTime();
        const dateB = new Date(b.transfer_datetime).getTime();
        return dateA - dateB;
      });
    } else {
      filtered.sort((a, b) => {
        const dateA = new Date(a.transfer_datetime).getTime();
        const dateB = new Date(b.transfer_datetime).getTime();
        return dateB - dateA;
      });
    }

    setTransactions(filtered);
  }, [dateOrder, selectedTransferTypes]);

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
                <ScrollView style={{ height: "100%" }}>
                  <Text style={styles.filterSubtitle}>Sort</Text>
                  <Text style={styles.filterOption}>Date Order</Text>
                  <Dropdown
                    value={dateOrder}
                    data={dateSort}
                    onChange={(value) => {
                      setDateOrder(value.value);
                    }}
                    labelField={"label"}
                    valueField={"value"}
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
                      marginBottom: 20,
                    }}
                  />
                  <Text style={styles.filterSubtitle}>Filter by</Text>
                  <Text style={styles.filterOption}>Transfer Type</Text>
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
                  <Text style={[styles.filterOption, { marginTop: 20 }]}>
                    Date Range
                  </Text>
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
                          : "End Date"}
                      </Text>
                    </TouchableOpacity>

                    <Text style={{ fontWeight: "bold", fontSize: 20 }}>-</Text>
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
                    onConfirm={(date) => {
                      setShowStartDatePicker(false);
                      setStartDate(date);
                    }}
                    onCancel={() => {
                      setShowStartDatePicker(false);
                    }}
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
                    onConfirm={(date) => {
                      setShowEndDatePicker(false);
                      setEndDate(date);
                    }}
                    onCancel={() => {
                      setShowEndDatePicker(false);
                    }}
                    pickerStyleIOS={{
                      width: deviceWidth,
                      padding: 0,
                      margin: 0,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  />
                </ScrollView>
              </View>
            );
          }}
          drawerType="front"
          drawerPosition="right"
          drawerStyle={{
            backgroundColor: "white",
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
              justifyContent: "flex-end",
              backgroundColor: "white",
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10,
                borderRadius: 10,
                margin: 10,
                borderColor: Colors.light.themeColor,
                borderWidth: 1,
                flexDirection: "row",
                gap: 10,
              }}
              onPress={() => setOpen(true)}
            >
              <Text style={{ color: Colors.light.themeColor }}>Filter</Text>
              <Ionicons name="filter" size={16}></Ionicons>
            </TouchableOpacity>
          </View>
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
                        backgroundColor: "#ccc",
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
            style={{ paddingVertical: 10, backgroundColor: "white" }}
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
                  }, 2000);
                }}
              />
            }
          />
        </Drawer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 10,
    width: "100%",
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
