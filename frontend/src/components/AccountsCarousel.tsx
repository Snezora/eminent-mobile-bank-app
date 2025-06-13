import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import Colors from "../constants/Colors";
import { Account } from "@/assets/data/types";
import { router } from "expo-router";

// https://rn-carousel.dev/

const AccountCarousel = ({
  accounts,
  onSelectItem,
  isEyeOpen,
}: {
  accounts: Account[];
  onSelectItem: (item: any) => void;
  isEyeOpen: boolean;
}) => {
  const progress = useSharedValue<number>(0);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const ref = React.useRef<ICarouselInstance>(null);

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = 0.9 * screenWidth;
  const cardHeight = cardWidth / (16 / 9);

  // Add a placeholder item for the "Add New Account" card
  const carouselData = [
    ...accounts,
    { id: "add-new-account", isAddCard: true },
  ];

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };

  const handleSnapToItem = (index: number) => {
    const selectedItem = carouselData[index];
    // Only call onSelectItem for actual accounts, not the add card
    if (!selectedItem.isAddCard) {
      onSelectItem(selectedItem);
    }
  };

  const handleAddNewAccount = () => {
    // Navigate to new account application page
    router.push({
      pathname: "/(user)/newAccount", // Adjust path as needed
    });
  };

  return (
    <View style={{ marginTop: 10 }}>
      <Carousel
        ref={ref}
        data={carouselData}
        loop={false}
        renderItem={({ item, index }) => {
          // Render "Add New Account" card
          if (item.isAddCard) {
            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  styles.addCard,
                  {
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                    borderWidth: 3,
                    borderStyle: "dashed",
                    borderColor: isDarkMode
                      ? Colors.dark.text
                      : Colors.light.themeColor,
                    backgroundColor: isDarkMode
                      ? Colors.dark.background
                      : Colors.light.background,
                  },
                ]}
                onPress={handleAddNewAccount}
                activeOpacity={0.7}
              >
                <View style={styles.addCardContent}>
                  <MaterialIcons
                    name="add-circle-outline"
                    size={60}
                    color={
                      isDarkMode ? Colors.dark.text : Colors.light.themeColor
                    }
                  />
                  <Text
                    style={[
                      styles.addCardText,
                      {
                        color: isDarkMode
                          ? Colors.dark.text
                          : Colors.light.themeColor,
                      },
                    ]}
                  >
                    Apply for New Account
                  </Text>
                  <Text
                    style={[
                      styles.addCardSubtext,
                      {
                        color: isDarkMode
                          ? Colors.dark.text
                          : Colors.light.text,
                      },
                    ]}
                  >
                    Tap to get started
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }

          // Render regular account card
          return (
            <View
              style={[
                styles.card,
                {
                  width: "100%",
                  height: "100%",
                  borderRadius: 10,
                  borderWidth: 5,
                  borderColor: Colors.light.background,
                },
              ]}
            >
              <Image
                source={require("@/assets/images/accountBackground.png")}
                contentFit="fill"
                style={[StyleSheet.absoluteFill, { borderRadius: 5 }]}
              />
              <View style={{ justifyContent: "space-evenly" }}>
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.cardText}>
                      {"nickname" in item
                        ? item.nickname ?? "No Nickname Set"
                        : ""}
                    </Text>
                    {"account_status" in item && (
                      <View
                        style={[
                          styles.statusContainer,
                          {
                            borderColor:
                              item.account_status === "Active"
                                ? "lightgreen"
                                : item.account_status === "Deactivated" ||
                                  item.account_status === "Blocked"
                                ? "red"
                                : item.account_status === "Pending"
                                ? "yellow"
                                : "gray",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                item.account_status === "Active"
                                  ? "lightgreen"
                                  : item.account_status === "Deactivated" ||
                                    item.account_status === "Blocked"
                                  ? "red"
                                  : item.account_status === "Pending"
                                  ? "yellow"
                                  : "gray",
                            },
                          ]}
                        >
                          {item.account_status}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.cardText, { marginTop: 0 }]}>
                    {isEyeOpen
                      ? "**** **** ****"
                      : "account_no" in item &&
                        typeof item.account_no === "string"
                      ? item.account_no.replace(/(\d{4})(?=\d)/g, "$1 ")
                      : ""}
                  </Text>
                </View>

                <View>
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Current Balance
                  </Text>
                  <Text style={[styles.cardText, { fontSize: 30 }]}>
                    USD{" "}
                    {isEyeOpen
                      ? "****"
                      : "balance" in item && typeof item.balance === "number"
                      ? item.balance.toFixed(2)
                      : ""}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: 10,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Account Type
                    </Text>
                    {"account_type" in item && (
                      <Text style={[styles.cardText]}>{item.account_type}</Text>
                    )}
                  </View>
                  {"account_id" in item && (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => {
                        router.push({
                          pathname: "/accountDetails",
                          params: { account_id: item.account_id },
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.cardText,
                          { fontSize: 16, textDecorationLine: "underline" },
                        ]}
                      >
                        More Details {">>>"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
        width={screenWidth}
        height={cardHeight}
        style={{}}
        onProgressChange={progress}
        onSnapToItem={handleSnapToItem}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.92,
          parallaxScrollingOffset: 60,
          parallaxAdjacentItemScale: 0.9,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#385a93",
    padding: 20,
    paddingVertical: 15,
    width: "90%",
    aspectRatio: "16/9",
    alignSelf: "center",
  },
  cardText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  statusContainer: {
    borderWidth: 4,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  addCard: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  addCardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  addCardText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },
  addCardSubtext: {
    fontSize: 14,
    marginTop: 5,
    opacity: 0.7,
    textAlign: "center",
  },
});

export default AccountCarousel;
