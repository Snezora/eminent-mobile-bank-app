import Colors from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { loans } from "@/assets/data/dummyLoans";
import AdminLoansBlock from "@/src/components/AdminLoansBlock";
import { Loan } from "@/assets/data/types";
import fetchLoans from "@/src/providers/fetchListofLoans";
import { useAuth } from "@/src/providers/AuthProvider";

const LoansPage = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newLoans, setNewLoans] = useState<Loan[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const { user, isAdmin } = useAuth();

  const sortByType = (loans: Loan[]) => {
    // Sort loans based on date first
    loans.sort((a, b) => {
      const dateA = new Date(a.application_date);
      const dateB = new Date(b.application_date);
      return dateB.getTime() - dateA.getTime();
    });

    const sortedLoans = [...loans].sort((a, b) => {
      if (a.final_approval === b.final_approval) return 0; // If both are the same, keep their order
      if (a.final_approval === null) return -1; // `null` comes first
      if (b.final_approval === null) return 1; // `null` comes first
      if (a.final_approval === true) return -1; // `true` comes before `false`
      if (b.final_approval === true) return 1; // `true` comes before `false`
      return 0;
    });
    return sortedLoans;
  };

  const fetchAndSetLoans = async () => {
    const fetchedLoans = await fetchLoans(user, isAdmin);

    if (fetchedLoans && Array.isArray(fetchedLoans.data)) {
      setNewLoans(sortByType(fetchedLoans.data));
    } else {
      console.error("Failed to fetch loans");
      setNewLoans([]);
    }
  };

  useEffect(() => {
    setPageLoading(true);
    //delay by 2 seconds
    setTimeout(() => {
      fetchAndSetLoans().then(() => setPageLoading(false));
    }, 2000)
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Colors.light.themeColor }}
        edges={["top"]}
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
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
              Loans
            </Text>
          </View>
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
                data={newLoans}
                entering={FadeIn.duration(1000)}
                renderItem={({ item, index }) => {
                  const prevItem = index > 0 ? newLoans[index - 1] : null;
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
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
  },
});

export default LoansPage;
