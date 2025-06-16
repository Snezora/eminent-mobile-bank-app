import { Link, Redirect, useRouter } from "expo-router";
import { StyleSheet, View, Image } from "react-native";
import { Button } from "react-native-ui-lib";
import { Dimensions } from "react-native";
import { useAuth } from "../providers/AuthProvider";
import { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeOut,
} from "react-native-reanimated";
import { supabase } from "../lib/supabase";

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

const IndexPage = () => {
  const { session, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    //sign out user
    // supabase.auth.signOut()
    const timer = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash && !loading) {
      if (!session) {
        router.replace("/(auth)/home-page");
      } else if (isAdmin) {
        router.dismissAll();
        router.replace("/(admin)");
      } else {
        router.dismissAll();
        router.replace("/(user)/(tabs)");
      }
    }
  }, [session, isAdmin, loading, showSplash]);

  const rotation = useSharedValue(0);

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
    <View style={styles.container}>
      <Animated.View
        style={[
          { flex: 1, justifyContent: "center", alignItems: "center" },
          animatedStyle,
        ]}
        exiting={FadeOut.duration(1000)}
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
    justifyContent: "center",
    gap: 50,
  },
});

export default IndexPage;
