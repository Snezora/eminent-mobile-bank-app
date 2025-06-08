import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Button,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/src/constants/Colors";
import { useAuth } from "@/src/providers/AuthProvider";
import { Account, Transaction } from "@/assets/data/types";
import fetchListofAccounts from "@/src/providers/fetchListofAccounts";
import fetchListofTransactions from "@/src/providers/fetchListofTransactions";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { DateSort, DateSortComponent } from "@/src/components/DateSort";
import { Platform, Dimensions } from "react-native";
import dayjs from "dayjs";

const deviceWidth = Dimensions.get("window").width;
import CustomerTransactionBlock from "@/src/components/CustomerTransactionBlock";
import { MaterialIcons } from "@expo/vector-icons";
import { useRealtimeSubscription } from "@/src/lib/useRealTimeSubscription";
import RotatingLogo from "@/src/components/spinningLogo";
import { Drawer } from "react-native-drawer-layout";
import Animated, { LinearTransition, SlideInUp } from "react-native-reanimated";

interface FilterOptions {
  selectedAccount: string | null;
  startDate: Date | null;
  endDate: Date | null;
  searchQuery: string;
}

const TransferHistory = () => {
  const router = useRouter();
  const isDarkMode = useColorScheme() === "dark";
  const { user } = useAuth();

  // State management
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    selectedAccount: null,
    startDate: null,
    endDate: null,
    searchQuery: "",
  });

  // Modal and picker states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    try {
      const fetchedAccounts = await fetchListofAccounts({
        isMockEnabled: false,
        isAdmin: false,
        customer_id: user?.customer_id,
      });
      setAccounts(fetchedAccounts ?? []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      Alert.alert("Error", "Failed to fetch accounts");
    }
  }, [user?.customer_id]);

  // Fetch all transactions for user's accounts
  const fetchAllTransactions = useCallback(async () => {
    try {
      setRefreshing(true);
      const allTransactions: Transaction[] = [];

      // Fetch transactions for each account
      for (const account of accounts) {
        const transactions = await fetchListofTransactions({
          isMockEnabled: false,
          isAdmin: false,
          initiator_account_id: account.account_id,
          receiver_account_no: account.account_no,
        });

        if (transactions) {
          allTransactions.push(...transactions);
        }
      }

      // Remove duplicates and sort by date (newest first)
      const uniqueTransactions = allTransactions.filter(
        (transaction, index, self) =>
          index ===
          self.findIndex((t) => t.transaction_id === transaction.transaction_id)
      );

      const sortedTransactions = uniqueTransactions.sort(
        (a, b) =>
          new Date(b.transfer_datetime).getTime() -
          new Date(a.transfer_datetime).getTime()
      );

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Error", "Failed to fetch transaction history");
    } finally {
      setTimeout(() => {
        setRefreshing(false);
        setLoading(false);
      }, 2000); // Simulate network delay
    }
  }, [accounts]);

  // Apply filters to transactions
  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    // Filter by account
    if (filters.selectedAccount) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.initiator_account_id === filters.selectedAccount ||
          transaction.receiver_account_no ===
            accounts.find((acc) => acc.account_id === filters.selectedAccount)
              ?.account_no
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(
        (transaction) =>
          new Date(transaction.transfer_datetime) >= filters.startDate!
      );
    }

    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (transaction) => new Date(transaction.transfer_datetime) <= endOfDay
      );
    }

    // Filter by search query (purpose or amount)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.purpose?.toLowerCase().includes(query) ||
          transaction.amount.toString().includes(query)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters, accounts]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      selectedAccount: null,
      startDate: null,
      endDate: null,
      searchQuery: "",
    });
  };

  // Realtime subscription callbacks
  const handleTransactionChange = useCallback(
    (payload: any) => {
      console.log("Transaction change received in history:", payload);
      fetchAllTransactions();
    },
    [fetchAllTransactions]
  );

  // Subscribe to realtime changes
  useRealtimeSubscription(
    "Transaction",
    handleTransactionChange,
    "*",
    !loading
  );

  // Effects
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchAllTransactions();
    }
  }, [accounts, fetchAllTransactions]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Prepare account dropdown data
  const accountDropdownData = [
    { label: "All Accounts", value: null },
    ...accounts.map((account) => ({
      label:
        account.nickname || `${account.account_type} - ${account.account_no}`,
      value: account.account_id,
    })),
  ];

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}
      >
        <RotatingLogo />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.light.themeColor }]}
      edges={["top"]}
    >
      {/* Main Content with Drawer */}
      <Drawer
        open={showFilterModal}
        onOpen={() => setShowFilterModal(true)}
        onClose={() => setShowFilterModal(false)}
        drawerType="front"
        drawerPosition="right"
        drawerStyle={{
          backgroundColor: isDarkMode
            ? "rgba(60, 60, 60, 1)"
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
        renderDrawerContent={() => {
          return (
            <View style={styles.drawerContent}>
              {/* Filter Header */}
              <View style={styles.drawerHeader}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    marginBottom: 20,
                    color: isDarkMode
                      ? Colors.dark.themeColorSecondary
                      : Colors.light.themeColor,
                  }}
                >
                  Filter Transactions
                </Text>
              </View>

              {/* Account Filter */}
              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Account
                </Text>
                <Dropdown
                  data={accountDropdownData}
                  value={filters.selectedAccount}
                  onChange={(item) =>
                    setFilters((prev) => ({
                      ...prev,
                      selectedAccount: item.value,
                    }))
                  }
                  labelField="label"
                  valueField="value"
                  placeholder="Select an account"
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: isDarkMode
                        ? Colors.dark.firstButton
                        : Colors.light.background,
                    },
                  ]}
                  placeholderStyle={[
                    styles.dropdownPlaceholder,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                  selectedTextStyle={[
                    styles.dropdownText,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                />
              </View>

              {/* Date Range Filter */}
              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Date Range
                </Text>

                <View style={styles.startEndDateContainer}>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(true)}
                    style={{
                      backgroundColor: isDarkMode
                        ? Colors.dark.firstButton
                        : Colors.light.background,
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
                          color: isDarkMode
                            ? Colors.dark.text
                            : Colors.light.text,
                        },
                      ]}
                    >
                      {filters.startDate
                        ? dayjs(filters.startDate).format("DD/MM/YY")
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
                      backgroundColor: isDarkMode
                        ? Colors.dark.firstButton
                        : Colors.light.background,
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
                        color: isDarkMode
                          ? Colors.dark.text
                          : Colors.light.text,
                      }}
                    >
                      {filters.endDate
                        ? dayjs(filters.endDate).format("DD/MM/YY")
                        : "End Date"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Updated Date Time Picker Modals */}
                <DateTimePickerModal
                  isVisible={showStartDatePicker}
                  mode="date"
                  date={filters.startDate ?? new Date()}
                  onConfirm={(date) => {
                    setShowStartDatePicker(false);
                    setFilters((prev) => ({ ...prev, startDate: date }));
                  }}
                  onCancel={() => {
                    setShowStartDatePicker(false);
                  }}
                  maximumDate={filters.endDate ?? new Date()}
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
                  date={filters.endDate ?? new Date()}
                  onConfirm={(date) => {
                    setShowEndDatePicker(false);
                    setFilters((prev) => ({ ...prev, endDate: date }));
                  }}
                  onCancel={() => {
                    setShowEndDatePicker(false);
                  }}
                  minimumDate={filters.startDate ?? new Date(0)}
                  maximumDate={new Date()}
                  pickerStyleIOS={{
                    width: deviceWidth,
                    padding: 0,
                    margin: 0,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                />
              </View>

              {/* Search Filter */}
              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Search (Amount/Purpose)
                </Text>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: isDarkMode
                        ? Colors.dark.firstButton
                        : Colors.light.background,
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                  value={filters.searchQuery}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, searchQuery: text }))
                  }
                  placeholder="Search by purpose or amount..."
                  placeholderTextColor={isDarkMode ? "#A9A9A9" : "#B0B0B0"}
                />
              </View>

              {/* Filter Actions */}
              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={[
                    styles.filterActionButton,
                    { backgroundColor: "#FF6B6B" },
                  ]}
                  onPress={() => {
                    clearFilters();
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={styles.filterActionText}>Clear Filters</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterActionButton,
                    { backgroundColor: Colors.light.themeColor },
                  ]}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.filterActionText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={Colors.dark.text}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: Colors.dark.text }]}>
            Transfer History
          </Text>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={styles.filterButton}
          >
            <MaterialIcons
              name="filter-list"
              size={24}
              color={Colors.dark.text}
            />
          </TouchableOpacity>
        </View>

        {/* Main Transaction List */}
        <View
          style={[
            styles.mainContent,
            {
              backgroundColor: isDarkMode
                ? Colors.dark.background
                : Colors.light.background,
            },
          ]}
        >
          {/* Transaction List */}
          <Animated.FlatList
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            data={filteredTransactions}
            keyExtractor={(item) => item.transaction_id}
            itemLayoutAnimation={LinearTransition}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchAllTransactions}
                tintColor={isDarkMode ? Colors.dark.text : Colors.light.text}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="receipt-long"
                  size={64}
                  color={isDarkMode ? Colors.dark.text : Colors.light.text}
                  style={{ opacity: 0.3 }}
                />
                <Text
                  style={[
                    styles.emptyText,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  No transactions found
                </Text>
                <Text
                  style={[
                    styles.emptySubtext,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  {transactions.length === 0
                    ? "You haven't made any transactions yet"
                    : "Try adjusting your filters"}
                </Text>
              </View>
            }
            renderItem={({ item, index }) => {
              const prevTransaction =
                index > 0 ? filteredTransactions[index - 1] : null;
              const showDateSeparator =
                !prevTransaction ||
                dayjs(item.transfer_datetime).format("YYYY-MM-DD") !==
                  dayjs(prevTransaction?.transfer_datetime).format(
                    "YYYY-MM-DD"
                  );

              const relatedAccount = accounts.find(
                (acc) =>
                  acc.account_id === item.initiator_account_id ||
                  acc.account_no === item.receiver_account_no
              );

              return (
                <View key={item.transaction_id}>
                  {showDateSeparator && (
                    <View style={styles.dateSeparator}>
                      <View
                        style={[
                          styles.dateLine,
                          { backgroundColor: Colors.light.themeColor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.dateText,
                          {
                            color: isDarkMode
                              ? Colors.dark.text
                              : Colors.light.text,
                          },
                        ]}
                      >
                        {dayjs(item.transfer_datetime).format("DD MMMM YYYY")}
                      </Text>
                      <View
                        style={[
                          styles.dateLine,
                          { backgroundColor: Colors.light.themeColor },
                        ]}
                      />
                    </View>
                  )}
                  {relatedAccount && (
                    <CustomerTransactionBlock
                      transaction={item}
                      account={relatedAccount}
                      isHistory={true}
                    />
                  )}
                  {index < filteredTransactions.length - 1 && (
                    <View style={styles.transactionSeparator} />
                  )}
                </View>
              );
            }}
          />
        </View>
      </Drawer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.themeColor,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  filterButton: {
    padding: 8,
  },
  activeFiltersContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  activeFilters: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  clearFiltersButton: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  clearFiltersText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  refreshText: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
  },
  transactionSeparator: {
    height: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalScrollView: {
    maxHeight: 400,
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
  },
  dropdownPlaceholder: {
    fontSize: 14,
  },
  dropdownText: {
    fontSize: 14,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 50,
  },
  dateButtonText: {
    fontSize: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 50,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },
  mainContent: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filterActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 50,
    paddingHorizontal: 20,
  },
  filterActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  filterActionText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  startEndDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 0,
    marginTop: 10,
  },
});

export default TransferHistory;
