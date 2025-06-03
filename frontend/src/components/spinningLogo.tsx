import { useEffect } from "react";
import { Image } from "expo-image";
import { View, StyleSheet, useColorScheme } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import Colors from "../constants/Colors";

const RotatingLogo = () => {
  const rotation = useSharedValue(0);
  const colorScheme = useColorScheme();

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1 // infinite
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colorScheme === "dark"
              ? Colors.dark.background
              : Colors.light.background,
        },
      ]}
    >
      <Animated.View
        style={[
          { flex: 1, justifyContent: "center", alignItems: "center" },
          animatedStyle,
        ]}
      >
        <Image
          source={require("@/assets/images/EWBLogo.png")}
          style={{ width: 100, height: 100 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RotatingLogo;
