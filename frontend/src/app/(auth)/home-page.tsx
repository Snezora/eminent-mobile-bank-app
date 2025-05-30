import { supabase } from "@/src/lib/supabase";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/src/constants/Colors";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  SlideInLeft,
  SlideInRight,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Svg, { SvgFromUri, SvgUri, SvgXml } from "react-native-svg";
import LayeredWavesHaikei from "@/assets/images/layered-waves-haikei (1).svg";
import EWBLogo from "@/assets/images/EWBLogo.svg";
import BlobHaikei from "@/assets/images/backgroundBlobs/blob-haikei.svg";
import Button from "@/src/components/Button";

const HomePageScreen = () => {

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: Colors.light.background }]}
      edges={["top"]}
    >
      <StatusBar style="dark" />
        <View style={styles.container}>
          <Animated.View
          sharedTransitionTag="blob"
            style={styles.backgroundImage}
            entering={SlideInRight.duration(800)}
            exiting={SlideInLeft.duration(800)}
          >
            <BlobHaikei
              style={[
                { transform: [{ translateY: -250 }, { translateX: 100 }] },
              ]}
            />
          </Animated.View>
          <Animated.View
            style={styles.backgroundImage}
            entering={SlideInLeft.duration(1000)}
            exiting={SlideInRight.duration(1000)}
          >
            <LayeredWavesHaikei style={{ transform: [{ translateY: 60 }] }} />
          </Animated.View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingRight: 10,
              alignItems: "center",
            }}
          >
            <Animated.View
              style={{ flexDirection: "row", alignItems: "center" }}
              entering={FadeInLeft.duration(1000)}
            >
              <Image
                source={require("@/assets/images/EWBLogo.png")}
                style={{ width: 60, height: 60 }}
              />
              <View>
                <Text style={styles.logoText}>Eminent Western</Text>
                <Text style={styles.logoText}>Bank</Text>
              </View>
            </Animated.View>
            <Animated.View
              style={{ flexDirection: "row", alignItems: "center" }}
              entering={FadeInRight.duration(1000)}
            >
              <Ionicons
                name="globe-outline"
                size={32}
                color="black"
                style={{ transform: [{ translateY: -5 }] }}
              />
            </Animated.View>
          </View>

          <View style={{ paddingHorizontal: 10, marginTop: 20 }}>
            <Animated.View
              entering={FadeInDown.duration(1000).withInitialValues({
                transform: [{ translateY: 50 }],
              })}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "bold",
                  color: Colors.light.themeColor,
                  marginTop: 30,
                  textOverflow: "ellipsis",
                  maxWidth: "70%",
                  textAlign: "justify",
                }}
              >
                Experience the Future of Banking
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInRight.delay(300).duration(1000)}>
              <Text
                style={{
                  fontSize: 20,
                  color: "black",
                  marginTop: 20,
                  textOverflow: "ellipsis",
                  maxWidth: "70%",
                  textAlign: "justify",
                }}
              >
                Unlock a world of endless financial possibilities with our
                cutting-edge banking app.
              </Text>
            </Animated.View>

            <Animated.View
              style={{
                height: 120,
                marginTop: 150,
                gap: 20,
                width: "70%",
                alignSelf: "center",
              }}
              entering={FadeInDown.delay(500).duration(1000)}
            >
              <Button
                label="Register"
                style={{}}
                textStyle={{ fontSize: 20, fontWeight: "bold" }}
                onClick={() => router.push("/(auth)/signup/sign-up")}
              ></Button>
              <Button
                label="Sign In"
                style={{ borderColor: "black", borderWidth: 1 }}
                type="transparent"
                textStyle={{ color: "black", fontSize: 20, fontWeight: "bold" }}
                onClick={() => router.push("/(auth)/sign-in")}
              ></Button>
            </Animated.View>
          </View>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.themeColor,
    fontFamily: "sans-serif",
  },
  backgroundImage: {
    flex: 1,
    height: "100%",
    position: "absolute",
    justifyContent: "flex-end",
    bottom: 0,
  },
});

export default HomePageScreen;
