import { supabase } from "@/src/lib/supabase";
import { router, Stack } from "expo-router";
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
import TopLeftBlob from "@/assets/images/backgroundBlobs/blob-haikei (3).svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm, SubmitHandler, Controller, FormState } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/src/providers/AuthProvider";

const scheme = yup.object({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const SignUpScreen = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { session } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(scheme),
  });

  const generateAccountNumber = async (): Promise<string> => {
    let accountNumber: string;
    let isUnique = false;

    while (!isUnique) {
      // Generate 12-digit number
      accountNumber = Math.floor(
        100000000000 + Math.random() * 900000000000
      ).toString();

      // Check if account number already exists in database
      const { data, error } = await supabase
        .from("Account")
        .select("account_no")
        .eq("account_no", accountNumber)
        .single();

      if (error && error.code === "PGRST116") {
        // No rows returned (PGRST116 = no rows), account number is unique
        isUnique = true;
      } else if (error) {
        console.error("Error checking account number:", error);
        throw new Error("Failed to validate account number");
      }
    }

    return accountNumber!;
  };

  const createDefaultSavingsAccount = async (
    customerId: string
  ): Promise<string | null> => {
    try {
      // Generate unique account number
      const accountNumber = await generateAccountNumber();

      const accountData = {
        customer_id: customerId,
        account_no: accountNumber,
        account_type: "Savings",
        balance: 0,
        account_status: "Pending",
        nickname: null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("Account").insert([accountData]);

      if (error) {
        console.error("Error creating default savings account:", error);
        throw error;
      }

      console.log("Default savings account created:", accountNumber);
      return accountNumber;
    } catch (error) {
      console.error("Failed to create default savings account:", error);
      return null;
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Sign up the user
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

      if (signUpError) {
        Alert.alert(signUpError.message);
        return;
      }

      const userUuid = signUpData.user?.id;

      if (!userUuid) {
        Alert.alert("User UUID not found. Please try again.");
        return;
      }

      const { data: insertData, error: insertError } = await supabase
        .from("Customer")
        .insert([
          {
            first_name: data.firstName,
            last_name: data.lastName,
            user_uuid: userUuid,
          },
        ])
        .select("*")
        .single();

      if (insertError) {
        Alert.alert(insertError.message);
        return;
      } else {
        console.log("Customer inserted successfully:", insertData);
        const accountNumber = await createDefaultSavingsAccount(
          insertData.customer_id
        );

        await supabase.auth.signOut();

        if (accountNumber) {
          Alert.alert(
            "Account Created Successfully!",
            `Welcome to Eminent Western Bank!\n\nYour savings account has been created:\nAccount Number: ${accountNumber}\n\nPlease verify your email to complete the setup.`,
            [
              {
                text: "OK",
                onPress: () => router.replace("/(auth)/sign-in"),
              },
            ]
          );
        } else {
          Alert.alert(
            "Registration Completed",
            "Your account has been created successfully. Please verify your email and contact support if you need assistance setting up your banking account.",
            [
              {
                text: "OK",
                onPress: () => router.replace("/(auth)/sign-in"),
              },
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert("An unexpected error occurred. Please try again.");
      console.error("Error during sign-up:", error);
    }
  };

  useEffect(() => {
    if (session) {
      router.replace("/(auth)/home-page");
      Alert.alert(
        "Already Logged In",
        "You are already logged in. Please log out to register a new account.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [session]);

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
          <TopLeftBlob
            style={[
              { transform: [{ translateY: -650 }, { translateX: -480 }] },
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
            <TouchableOpacity onPress={() => router.back()} activeOpacity={1}>
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
                Register
              </Text>
            </View>
          </Animated.View>
        </View>
        <KeyboardAwareScrollView>
          <Animated.View entering={FadeInDown.duration(1000)}>
            <View style={{ paddingHorizontal: 10, marginTop: 50, gap: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: "45%" }}>
                  <Controller
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>First Name</Text>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor={Colors.light.themeColor}
                          style={styles.input}
                        />
                      </View>
                    )}
                    name="firstName"
                  />
                  {errors.firstName && (
                    <Text style={styles.error}>
                      {errors.firstName?.message}
                    </Text>
                  )}
                </View>
                <View style={{ width: "45%" }}>
                  <Controller
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Last Name</Text>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor={Colors.light.themeColor}
                          style={styles.input}
                        />
                      </View>
                    )}
                    name="lastName"
                  />
                  {errors.lastName && (
                    <Text style={styles.error}>{errors.lastName?.message}</Text>
                  )}
                </View>
              </View>
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

              <View>
                <Controller
                  control={control}
                  rules={{ required: true, minLength: 8 }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ gap: 5 }}>
                      <Text style={styles.inputTitle}>Confirm Password</Text>
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
                          secureTextEntry={!showConfirmPassword}
                          style={{ flex: 1, width: "100%" }}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showPassword)}
                          activeOpacity={0.8}
                          style={{ paddingHorizontal: 10 }}
                        >
                          <Ionicons
                            name={showConfirmPassword ? "eye" : "eye-off"}
                            size={24}
                            color={Colors.light.themeColor}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  name="confirmPassword"
                />
                {errors.confirmPassword && (
                  <Text style={styles.error}>
                    {errors.confirmPassword?.message}
                  </Text>
                )}
              </View>
              <Button
                title="Register"
                onPress={handleSubmit((data) => {
                  console.log("Validation passed, calling onSubmit...");
                  onSubmit(data);
                })}
                color={Colors.light.themeColor}
              />
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
});

export default SignUpScreen;
