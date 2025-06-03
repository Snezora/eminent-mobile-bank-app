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
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import Colors from "../constants/Colors";
import { Account } from "@/assets/data/types";

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
    const selectedItem = accounts[index];
    onSelectItem(selectedItem);
  };

  return (
    <View style={{ marginTop: 10 }}>
      <Carousel
        ref={ref}
        data={accounts}
        
        loop={false}
        renderItem={({ item, index }) => {
          return (
            <View
              style={[
                styles.card,
                {
                  width: "100%",
                  height: "100%",
                  borderRadius: 10,
                  borderWidth: 5,
                  // borderColor: isDarkMode
                  //   ? Colors.light.background
                  //   : Colors.dark.background,
                  borderColor: Colors.light.background,
                },
              ]}
            >
              <Image
                source={require("@/assets/images/accountBackground.png")}
                contentFit="fill"
                style={[StyleSheet.absoluteFill, { borderRadius: 5 }]}
              />
              <View
                style={{
                  flexDirection: "row",
                  // alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.cardText}>
                  {item.nickname ?? "No Nickname Set"}
                </Text>
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
                          : "gray", // Default color if no matching status
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
              </View>

              <Text style={[styles.cardText, { marginTop: 0 }]}>
                {isEyeOpen
                  ? "**** **** ****"
                  : item.account_no.replace(/(\d{4})(?=\d)/g, "$1 ")}
              </Text>

              <Text
                style={{ marginTop: 20, color: "white", fontWeight: "bold" }}
              >
                Current Balance
              </Text>
              <Text style={[styles.cardText, { fontSize: 30 }]}>
                USD {isEyeOpen ? "****" : item.balance.toFixed(2)}
              </Text>

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
                  <Text style={[styles.cardText]}>{item.account_type}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.5} onPress={() => {
                  console.log("More Details for ", item.account_no)
                }}>
                  <Text style={[styles.cardText, {fontSize: 16, textDecorationLine: "underline"}]}>More Details >>></Text>
                </TouchableOpacity>
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
});

export default AccountCarousel;
