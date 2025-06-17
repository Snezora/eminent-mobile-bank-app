import { supabase } from "@/src/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Step 1: Request password reset email
const emailSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
});

// Step 2: Reset password with new password
const resetSchema = yup.object({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const ForgotPasswordScreen = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Development mode - set to true for easier testing
  const isDevelopmentMode = __DEV__; // This is true when running in development

  // Form for email step
  const emailForm = useForm({
    resolver: yupResolver(emailSchema),
  });

  // Form for password reset step
  const resetForm = useForm({
    resolver: yupResolver(resetSchema),
  });
  const handleSendResetEmail = async (data: { email: string }) => {
    setLoading(true);
    try {
      // For development with Expo Go, we'll skip the email redirect approach
      // and use a simpler flow that works with localhost
      const { error } = await supabase.auth.resetPasswordForEmail(data.email);

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setUserEmail(data.email);
      setEmailSent(true);
      Alert.alert(
        "Reset Email Sent",
        `We've sent a password reset link to ${data.email}. After clicking the link in your email, you can return here to set your new password.`,
        [
          {
            text: "I clicked the email link",
            style: "default",
            onPress: () => {
              // Move to password reset step after user confirms they clicked email link
              setStep("reset");
            },
          },
          {
            text: "OK",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Error sending reset email:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      Alert.alert(
        "Password Updated",
        "Your password has been successfully updated. You can now sign in with your new password.",
        [
          {
            text: "Sign In",
            onPress: () => {
              router.dismissAll();
              router.push("/(auth)/sign-in");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error updating password:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = () => {
    if (userEmail) {
      handleSendResetEmail({ email: userEmail });
    }
  };

  const renderEmailStep = () => (
    <Animated.View entering={FadeInDown.duration(1000)}>
      <View style={{ paddingHorizontal: 10, marginTop: 180, gap: 30 }}>
        <View>
          <Text style={styles.description}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </View>
        <View>
          <Controller
            control={emailForm.control}
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
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}
            name="email"
          />
          {emailForm.formState.errors.email && (
            <Text style={styles.error}>
              {emailForm.formState.errors.email?.message}
            </Text>
          )}
        </View>
        <Button
          title={emailSent ? "Resend Reset Email" : "Send Reset Email"}
          onPress={emailForm.handleSubmit(handleSendResetEmail)}
          color={Colors.light.themeColor}
          disabled={loading}
        />
        {emailSent && (
          <View style={styles.emailSentContainer}>
            <Ionicons
              name="mail-outline"
              size={24}
              color={Colors.light.themeColor}
            />
            <Text style={styles.emailSentText}>
              Reset email sent to {userEmail}
            </Text>
            <Text style={styles.emailSentSubtext}>
              1. Check your email for the reset link{"\n"}
              2. Click the link in your email{"\n"}
              3. Return here and tap "I clicked the email link"
            </Text>
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={() => setStep("reset")}
              activeOpacity={0.8}
            >
              <Text style={styles.proceedButtonText}>
                I clicked the email link - Proceed to reset
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.backToSignIn}
          onPress={() => {
            router.dismissAll();
            router.push("/(auth)/sign-in");
          }}
        >
          <Text style={styles.backToSignInText}>
            Remember your password? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderResetStep = () => (
    <Animated.View entering={FadeInDown.duration(1000)}>
      <View style={{ paddingHorizontal: 10, marginTop: 180, gap: 30 }}>
        <View>
          <Text style={styles.description}>Enter your new password below.</Text>
        </View>

        <View>
          <Controller
            control={resetForm.control}
            rules={{ required: true, minLength: 8 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ gap: 5 }}>
                <Text style={styles.inputTitle}>New Password</Text>
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
                    placeholder="Enter new password"
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
          {resetForm.formState.errors.password && (
            <Text style={styles.error}>
              {resetForm.formState.errors.password?.message}
            </Text>
          )}
        </View>

        <View>
          <Controller
            control={resetForm.control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ gap: 5 }}>
                <Text style={styles.inputTitle}>Confirm New Password</Text>
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
                    placeholder="Confirm new password"
                    placeholderTextColor={Colors.light.themeColor}
                    secureTextEntry={!showConfirmPassword}
                    style={{ flex: 1 }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
          {resetForm.formState.errors.confirmPassword && (
            <Text style={styles.error}>
              {resetForm.formState.errors.confirmPassword?.message}
            </Text>
          )}
        </View>

        <Button
          title="Update Password"
          onPress={resetForm.handleSubmit(handleResetPassword)}
          color={Colors.light.themeColor}
          disabled={loading}
        />
      </View>
    </Animated.View>
  );

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
                router.navigate("/(auth)/sign-in");
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
                  fontSize: 34,
                  fontWeight: "bold",
                  color: Colors.light.themeColor,
                  textAlign: "justify",
                }}
              >
                Reset Password
              </Text>
            </View>
          </Animated.View>
        </View>
        <KeyboardAwareScrollView>
          {step === "email" ? renderEmailStep() : renderResetStep()}
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
  description: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 10,
  },
  emailSentContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f9ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.themeColor,
    gap: 10,
  },
  emailSentText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.themeColor,
    textAlign: "center",
  },
  emailSentSubtext: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    lineHeight: 20,
  },
  backToSignIn: {
    alignItems: "center",
    padding: 10,
  },
  backToSignInText: {
    fontSize: 16,
    color: Colors.light.themeColor,
    textDecorationLine: "underline",
  },
  proceedButton: {
    backgroundColor: Colors.light.themeColor,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  proceedButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  devButton: {
    backgroundColor: "#ff6b35",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#ff4500",
  },
  devButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ForgotPasswordScreen;
