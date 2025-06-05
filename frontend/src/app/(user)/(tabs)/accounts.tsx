import React, { useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Colors from "@/src/constants/Colors";
import AccountCarousel from "@/src/components/AccountsCarousel";
import { useEffect, useState } from "react";
import { Account, Transaction } from "@/assets/data/types";
import fetchListofAccounts from "@/src/providers/fetchListofAccounts";
import { useAuth } from "@/src/providers/AuthProvider";
import { supabase } from "@/src/lib/supabase";
import SettingsLogOut from "@/src/components/SettingsLogOut";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as LocalAuthentication from "expo-local-authentication";
import { Card } from "react-native-ui-lib";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import RotatingLogo from "@/src/components/spinningLogo";
import Animated, { FadeIn } from "react-native-reanimated";
import { router } from "expo-router";
import fetchListofTransactions from "@/src/providers/fetchListofTransactions";
import dayjs from "dayjs";
import CustomerTransactionBlock from "@/src/components/CustomerTransactionBlock";
import type { RealtimeChannel } from "@supabase/supabase-js";

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const { user, isBiometricAuthenticated, authenticateBiometric } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(
    accounts[0]
  );
  const insets = useSafeAreaInsets();
  const [carouselHeight, setCarouselHeight] = useState<number>(0);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [carouselTop, setCarouselTop] = useState<number>(0);
  const [isEyeOpen, setIsEyeOpen] = useState(true);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handleEyePress = async () => {
    if (!isBiometricAuthenticated) {
      authenticateBiometric().then((success) => {
        if (success) {
          setIsEyeOpen(!isEyeOpen);
        } else {
          return;
        }
      });
    } else {
      setIsEyeOpen(!isEyeOpen);
    }
  };

  const handleSelectItem = (item: any) => {
    setSelectedAccount(item); // Update the selected account
  };

  useEffect(() => {    

    const fetchAccounts = () =>
      fetchListofAccounts({
        isMockEnabled: false,
        isAdmin: false,
        customer_id: user?.customer_id,
      })
        .then((fetchedAccounts) => {
          setAccounts(fetchedAccounts ?? []);
          setSelectedAccount(fetchedAccounts?.[0] ?? null);

          const totalAmount = fetchedAccounts?.reduce(
            (total, account) => total + account.balance,
            0
          );
          setTotalAmount(totalAmount ?? 0);
        })
        .finally(() => {
          setTimeout(() => {
            setPageLoading(false);
          }, 1000);
        });

    fetchAccounts();

    // const channels = supabase
    //   .channel("custom-all-channel")
    //   .on(
    //     "postgres_changes",
    //     { event: "*", schema: "public", table: "Account" },
    //     (payload) => {
    //       console.log("Account change received!", payload);
    //       fetchAccounts();
    //     }
    //   )
    //   .on(
    //     "postgres_changes",
    //     { event: "*", schema: "public", table: "Transaction" },
    //     (payload) => {
    //       console.log("Transaction change received!", payload);
    //       // Add logic to handle transaction changes here
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   console.log("Unsubscribing from Supabase channel...");
    //   supabase.removeAllChannels(); // Ensure proper cleanup
    // };
  }, []);

  useEffect(() => {
    if (accounts.length == 0) return;
    setTransactionLoading(true);
    const fetchAccountData = async () => {
      const transactions = await fetchListofTransactions({
        isMockEnabled: false,
        isAdmin: false,
        initiator_account_id: selectedAccount?.account_id,
        receiver_account_no: selectedAccount?.account_no,
      });

      setTransactions(transactions ?? []);
    };

    fetchAccountData().then(() => {
      setTimeout(() => {
        setTransactionLoading(false);
      }, 2000);
    });
  }, [selectedAccount]);

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#385A93" }]}
      edges={["top"]}
    >
      {pageLoading && <RotatingLogo />}
      {!pageLoading && (
        <>
          <Animated.View
            style={[styles.topContainer]}
            entering={FadeIn.duration(500)}
          >
            <View
              style={{
                alignItems: "flex-end",
                backgroundColor: Colors.light.themeColor,
                paddingRight: 20,
              }}
            >
              <SettingsLogOut />
            </View>
            <View
              onLayout={(event) => {
                const { height, y } = event.nativeEvent.layout;
                const safeAreaTop = insets.top;
                setCarouselTop(y + height + safeAreaTop + 10);
              }}
              style={{
                backgroundColor: Colors.light.themeColor,
                alignItems: "center",
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  gap: 20,
                }}
              >
                <Text style={[styles.title]}>TOTAL BALANCE</Text>
                <TouchableOpacity>
                  <Ionicons
                    name={isEyeOpen ? "eye-off" : "eye"}
                    size={30}
                    color={"white"}
                    onPress={handleEyePress}
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.title]}>
                USD {isEyeOpen ? "****" : totalAmount.toFixed(2)}
              </Text>
            </View>
          </Animated.View>

          <View
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setCarouselHeight(height);
            }}
            style={[styles.carouselContainer, { top: carouselTop }]}
          >
            <AccountCarousel
              accounts={accounts}
              onSelectItem={handleSelectItem}
              isEyeOpen={isEyeOpen}
            />
          </View>

          <View
            style={{
              backgroundColor: Colors.light.themeColor,
              zIndex: 1,
              height: carouselHeight / 2 - 10,
            }}
          ></View>
          <View
            style={[
              styles.bottomContainer,
              {
                backgroundColor: isDarkMode
                  ? Colors.dark.background
                  : Colors.light.background,
                paddingTop: carouselHeight / 2,
              },
            ]}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-evenly" }}
            >
              <Card
                style={[
                  styles.upperCard,
                  {
                    backgroundColor: isDarkMode
                      ? Colors.dark.firstButton
                      : "white",
                  },
                ]}
                onPress={() => {
                  if (isBiometricAuthenticated) {
                    router.push({
                      pathname: "/(user)/camera",
                      params: { account_no: selectedAccount?.account_no },
                    });
                  } else {
                    authenticateBiometric().then((success) => {
                      if (success) {
                        router.push({
                          pathname: "/(user)/camera",
                          params: { account_no: selectedAccount?.account_no },
                        });
                      } else {
                        return;
                      }
                    });
                  }
                }}
              >
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={30}
                  color={isDarkMode ? Colors.dark.text : Colors.light.text}
                />
                <Text
                  style={{
                    color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Pay / Receive
                </Text>
              </Card>
              <Card
                style={[
                  styles.upperCard,
                  {
                    backgroundColor: isDarkMode
                      ? Colors.dark.firstButton
                      : "white",
                  },
                ]}
                onPress={() => {
                  if (isBiometricAuthenticated) {
                    router.push({
                      pathname: "/(user)/(transfer)/transferHome",
                    });
                  } else {
                    authenticateBiometric().then((success) => {
                      if (success) {
                        router.push({
                          pathname: "/(user)/(transfer)/transferHome",
                        });
                      } else {
                        return;
                      }
                    });
                  }
                }}
              >
                <MaterialCommunityIcons
                  name="bank-transfer-out"
                  size={36}
                  color={isDarkMode ? Colors.dark.text : Colors.light.text}
                />
                <Text
                  style={{
                    color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Transfer
                </Text>
              </Card>
            </View>
            <View id="transactionHistory" style={{ marginTop: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: isDarkMode ? Colors.dark.text : Colors.light.text,
                  }}
                >
                  Recent Transaction History
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    textDecorationLine: "underline",
                    alignSelf: "center",
                  }}
                >
                  View All
                </Text>
              </View>
              {(transactionLoading ||
                isEyeOpen ||
                transactions.length === 0) && (
                <View
                  style={{
                    backgroundColor: Colors.light.themeColor,
                    height: 2,
                    marginVertical: 10,
                  }}
                ></View>
              )}

              {isEyeOpen && (
                <View
                  style={{
                    alignItems: "center",
                    height: "70%",
                    justifyContent: "center",
                    gap: 20,
                  }}
                >
                  <MaterialCommunityIcons
                    name="database-eye-off-outline"
                    size={42}
                    color={isDarkMode ? Colors.dark.text : Colors.light.text}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    }}
                  >
                    Press the eye icon on top to show.
                  </Text>
                </View>
              )}

              {!isEyeOpen && transactionLoading && (
                <ActivityIndicator
                  size={"large"}
                  style={{ alignSelf: "center", paddingTop: 100 }}
                />
              )}
              {!isEyeOpen && !transactionLoading && transactions && (
                <Animated.FlatList
                  entering={FadeIn.duration(1000)}
                  data={transactions.slice(0, 5)}
                  renderItem={({ item, index }) => {
                    const prevItem = index > 0 ? transactions[index - 1] : null;
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
                          <>
                            <View
                              style={{
                                backgroundColor: Colors.light.themeColor,
                                height: 2,
                                marginVertical: 10,
                              }}
                            ></View>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "bold",
                                paddingBottom: 15,
                                color: isDarkMode
                                  ? Colors.dark.text
                                  : Colors.light.text,
                              }}
                            >
                              {dayjs(item.transfer_datetime).format(
                                "DD MMMM YYYY"
                              )}
                            </Text>
                          </>
                        )}
                        {selectedAccount && (
                          <CustomerTransactionBlock
                            transaction={item}
                            account={selectedAccount}
                          />
                        )}
                      </>
                    );
                  }}
                ></Animated.FlatList>
              )}
              {!isEyeOpen &&
                !transactionLoading &&
                transactions.length === 0 && (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      height: "50%",
                      gap: 20,
                    }}
                  >
                    <AntDesign
                      name="closecircleo"
                      size={42}
                      color={isDarkMode ? Colors.dark.text : Colors.light.text}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        paddingBottom: 15,
                        color: isDarkMode
                          ? Colors.dark.text
                          : Colors.light.text,
                      }}
                    >
                      No Transaction History
                    </Text>
                  </View>
                )}
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  topContainer: {
    paddingTop: 15,
    paddingBottom: 30,
    backgroundColor: Colors.light.themeColor,
  },
  bottomBackground: {
    backgroundColor: "white",
    marginTop: 0, // Adjust this to overlap the carousel
    zIndex: 1,
  },
  carouselContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 90,
  },
  bottomContainer: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 15,
  },
  upperCard: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    maxWidth: "40%",
    width: "40%",
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
