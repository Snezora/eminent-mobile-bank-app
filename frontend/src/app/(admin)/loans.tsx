import Colors from "@/src/constants/Colors";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TextInput,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { loans } from "@/assets/data/dummyLoans";
import AdminLoansBlock from "@/src/components/AdminLoansBlock";
import { Loan } from "@/assets/data/types";
import fetchLoans from "@/src/providers/fetchListofLoans";
import { useAuth } from "@/src/providers/AuthProvider";
import Modal from "react-native-modal";
import { supabase } from "@/src/lib/supabase";
import dayjs from "dayjs";
import { Drawer } from "react-native-drawer-layout";
import Button from "@/src/components/Button";
import { Dropdown } from "react-native-element-dropdown";

const loanStatus = [
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

const LoansPage = () => {
  const [allLoans, setAllLoans] = useState<Loan[]>([]); // Full list of loans
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]); // Filtered list of loans
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [updateTime, setUpdateTime] = useState(new Date());
  const [searchName, setSearchName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { isAdmin, isMockEnabled } = useAuth();
  const [open, setOpen] = useState(false);

  // Sort loans by type
  const sortByType = (loans: Loan[]) => {
    return [...loans].sort((a, b) => {
      if (a.final_approval === b.final_approval) {
        return (
          new Date(b.application_date).getTime() -
          new Date(a.application_date).getTime()
        );
      }
      if (a.final_approval === null) return -1; // Pending loans come first
      if (b.final_approval === null) return 1;
      if (a.final_approval === true) return -1; // Approved loans come before Rejected
      if (b.final_approval === true) return 1;
      return 0;
    });
  };

  // Fetch loans from the server
  const fetchAndSetLoans = async () => {
    setPageLoading(true);
    try {
      const fetchedLoans = await fetchLoans(!!isMockEnabled, !!isAdmin);
      if (fetchedLoans && Array.isArray(fetchedLoans.data)) {
        const sortedLoans = sortByType(fetchedLoans.data);
        setAllLoans(sortedLoans); // Store the full list of loans
        setFilteredLoans(sortedLoans); // Initially, filtered list is the same as the full list
      } else {
        console.error("Failed to fetch loans");
        setAllLoans([]);
        setFilteredLoans([]);
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setPageLoading(false);
      setUpdateTime(new Date());
    }
  };

  // Apply filters locally
  const applyFilters = async () => {
    let filtered = [...allLoans];

    if (searchName) {
      // Fetch customers matching the search name
      const { data: customers, error } = await supabase
        .from("Customer")
        .select("*")
        .or(`first_name.ilike.%${searchName}%,last_name.ilike.%${searchName}%`);

      if (error) {
        console.error("Error fetching customers:", error);
      } else {
        filtered = filtered.filter((loan) =>
          customers?.some(
            (customer) => customer.customer_id === loan.customer_id
          )
        );
      }
    }

    if (selectedStatus) {
      // Filter loans by status
      filtered = filtered.filter((loan) => {
        if (selectedStatus === "Approved") return loan.final_approval === true;
        if (selectedStatus === "Rejected") return loan.final_approval === false;
        return loan.final_approval === null; // Pending
      });
    }

    setFilteredLoans(filtered); // Update the filtered list
  };

  // Fetch loans on component mount
  useEffect(() => {
    fetchAndSetLoans();

    // Real-time subscription to loan changes
    const channel = supabase
      .channel("loan-changes-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Loan" },
        async () => {
          await fetchAndSetLoans(); // Re-fetch loans on database changes
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMockEnabled, isAdmin]);

  // Apply filters whenever searchName or selectedStatus changes
  useEffect(() => {
    applyFilters();
  }, [searchName, selectedStatus, allLoans]);

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

                  <Text style={styles.filterSubtitle}>Filter By:</Text>
                  <View style={styles.filterItem}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={styles.filterOption}>Loan Status</Text>
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
                        data={loanStatus}
                        placeholder="Search by loan status"
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
                        setSelectedStatus(null);
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
                  Loans
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(admin)/addLoan")}
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
            <View
              style={{ borderColor: Colors.light.themeColor, borderWidth: 1 }}
            ></View>
            <View style={styles.mainContainer}>
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
                <Animated.FlatList
                  data={filteredLoans}
                  itemLayoutAnimation={LinearTransition}
                  keyExtractor={(item) => item.loan_id.toString()}
                  renderItem={({ item, index }) => {
                    const prevItem =
                      index > 0 ? filteredLoans[index - 1] : null;
                    const showSeparator =
                      index === 0 ||
                      (prevItem &&
                        prevItem.final_approval !== item.final_approval);

                    return (
                      <>
                        {showSeparator && (
                          <View
                            style={{
                              backgroundColor:
                                item.final_approval === null
                                  ? Colors.light.themeColor
                                  : item.final_approval
                                  ? "green"
                                  : Colors.light.themeColorReject,
                              marginBottom: 20,
                              paddingVertical: 5,
                              width: "30%",
                              alignSelf: "center",
                              borderRadius: 30,
                              borderWidth: 4,
                              borderColor:
                                item.final_approval === null
                                  ? Colors.light.themeColor
                                  : item.final_approval
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
                              {item.final_approval === null
                                ? "Pending"
                                : item.final_approval === true
                                ? "Approved"
                                : "Declined"}
                            </Text>
                          </View>
                        )}
                        <AdminLoansBlock loan={item} />
                      </>
                    );
                  }}
                  ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
                  refreshControl={
                    <RefreshControl
                      refreshing={loading}
                      onRefresh={() => {
                        setLoading(true);
                        //wait for 5 seconds
                        setTimeout(() => {
                          fetchAndSetLoans().then(() => setLoading(false));
                        }, 2000);
                      }}
                    />
                  }
                />
              )}
            </View>
          </View>
        </Drawer>
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

export default LoansPage;
