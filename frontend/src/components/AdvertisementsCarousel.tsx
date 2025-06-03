import React from "react";
import { Dimensions, StyleSheet, Text, useColorScheme, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import Colors from "../constants/Colors";

// https://rn-carousel.dev/

const AdvertisementsCarousel = () => {
  const progress = useSharedValue<number>(0);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";

  const data = [
    { id: 1, title: "First Item" },
    { id: 2, title: "Second Item" },
    { id: 3, title: "Third Item" },
  ];

  const ref = React.useRef<ICarouselInstance>(null);

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = 0.9 * screenWidth;
  const cardHeight = cardWidth / (16/9);

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

  return (
    <View style={{ gap: 10 }}>
      <Carousel
        ref={ref}
        data={data}
        renderItem={({ item, index }) => {
          return (
            <View style={[styles.card, { backgroundColor: isDarkMode ? Colors.dark.firstButton : "white" }]}>
              <Text style={{ color: isDarkMode ? Colors.dark.text : Colors.light.text }}>{item.title} test</Text>
            </View>
          );
        }}
        width={Dimensions.get("window").width}
        height={cardHeight}
        style={{
          width: Dimensions.get("window").width,
        }}
        onProgressChange={progress}
        onSnapToItem={(index) => {}}
        autoPlay
        autoPlayInterval={5000}
        mode="parallax"
				modeConfig={{
					parallaxScrollingScale: 0.92,
					parallaxScrollingOffset: 60,
          parallaxAdjacentItemScale: 0.9,
				}}
      />
      <Pagination.Basic
        progress={progress}
        data={data}
        dotStyle={{ backgroundColor: "#262626" }}
        activeDotStyle={{ backgroundColor: "white" }}
        containerStyle={{ gap: 10, marginBottom: 10 }}
        onPress={onPressPagination}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 10,
    width: "90%",
    aspectRatio: "16/9",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});

export default AdvertisementsCarousel;
