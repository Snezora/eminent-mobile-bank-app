import { supabase } from "@/src/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/src/constants/Colors";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  SlideInLeft,
  SlideInRight,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import LayeredWavesHaikei from "@/assets/images/layered-waves-haikei (1).svg";
import TopRightBlob from "@/assets/images/backgroundBlobs/toprightblob.svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/src/providers/AuthProvider";

const scheme = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const SignInScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(scheme),
  });
  const { session, isAdmin, loading, isMockEnabled } = useAuth();

  const onSubmit = async (data: any) => {
    let mockEmail = "admin@ewb.com";
    let mockPassword = "abcd1234";

    console.log(session, isAdmin, loading, isMockEnabled);

    if (
      isMockEnabled &&
      data.email === mockEmail &&
      data.password === mockPassword
    ) {
      console.log(
        "Mock sign-in successful. Waiting for AuthProvider to update..."
      );
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        Alert.alert(error.message);
        return;
      }

      console.log("Sign-in successful. Waiting for AuthProvider to update...");
    } catch (error) {
      console.error("Error during sign-in:", error);
      Alert.alert("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (!loading && session) {
      console.log("AuthProvider updated. Redirecting...");
      console.log("Redirecting to the appropriate screen...");
      router.dismissAll();
      isAdmin ? router.push("/(admin)") : router.push("/(user)/(tabs)");
    }
  }, [isAdmin, session]);

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: Colors.light.background,
          overflow: "hidden",
        },
      ]}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Animated.View
          sharedTransitionTag="blob"
          style={styles.backgroundImage}
          entering={SlideInLeft.duration(800)}
          exiting={SlideInRight.duration(800)}
        >
          <TopRightBlob
            style={[
              { transform: [{ translateY: -450 }, { translateX: -480 }] },
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
            alignItems: "center",
            paddingRight: 10,
          }}
        >
          <Animated.View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              paddingTop: 15,
              paddingLeft: 10,
              height: "100%",
            }}
            entering={FadeInRight.duration(1000)}
          >
            <TouchableOpacity
              onPress={() => {
                router.dismissAll();
                router.navigate("/home-page");
              }}
              activeOpacity={1}
            >
              <Ionicons name="chevron-back" size={32} color="black" />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={{ flexDirection: "row", alignItems: "center" }}
            entering={FadeInLeft.duration(1000)}
          >
            <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
              <Image
                source={require("@/assets/images/EWBLogo.png")}
                style={{ width: 60, height: 60 }}
              />
              <Text
                style={{
                  fontSize: 42,
                  fontWeight: "bold",
                  color: Colors.light.themeColor,
                  textAlign: "justify",
                }}
              >
                Sign In
              </Text>
            </View>
          </Animated.View>
        </View>
        <KeyboardAwareScrollView>
          <Animated.View entering={FadeInDown.duration(1000)}>
            <View style={{ paddingHorizontal: 10, marginTop: 180, gap: 30 }}>
              <View>
                <Controller
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ gap: 5 }}>
                      <Text style={styles.inputTitle}>Email</Text>
                      <TextInput
                        placeholder="example@ewb.com"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholderTextColor={Colors.light.themeColor}
                        style={styles.input}
                      />
                    </View>
                  )}
                  name="email"
                />
                {errors.email && (
                  <Text style={styles.error}>{errors.email?.message}</Text>
                )}
              </View>
              <View>
                <Controller
                  control={control}
                  rules={{ required: true, minLength: 8 }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ gap: 5 }}>
                      <Text style={styles.inputTitle}>Password</Text>
                      <View
                        style={[
                          styles.input,
                          {
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor={Colors.light.themeColor}
                          secureTextEntry={!showPassword}
                          style={{ flex: 1 }}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          activeOpacity={0.8}
                          style={{ paddingHorizontal: 10 }}
                        >
                          <Ionicons
                            name={showPassword ? "eye" : "eye-off"}
                            size={24}
                            color={Colors.light.themeColor}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  name="password"
                />
                {errors.password && (
                  <Text style={styles.error}>{errors.password?.message}</Text>
                )}
              </View>
              <Button
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                color={Colors.light.themeColor}
                disabled={loading}
              />
              {/* <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                style={styles.forgotPasswordContainer}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity> */}
            </View>
          </Animated.View>
        </KeyboardAwareScrollView>
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
  input: {
    borderWidth: 2,
    borderColor: Colors.light.themeColor,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.themeColor,
    marginBottom: 5,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: -10,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: 15,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: Colors.light.themeColor,
    textDecorationLine: "underline",
  },
});

export default SignInScreen;
