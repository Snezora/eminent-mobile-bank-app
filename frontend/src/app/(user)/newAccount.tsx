import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import Colors from "@/src/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextInput } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const schema = yup.object().shape({
  account_type: yup.string().required("Please select an account type"),
  nickname: yup
    .string()
    .max(20, "Nickname must be 20 characters or less")
    .optional(),
  initial_deposit: yup
    .number()
    .min(100, "Minimum initial deposit is $100")
    .max(50000, "Maximum initial deposit is $50,000")
    .required("Initial deposit is required"),
});

const ACCOUNT_TYPES = [
  {
    type: "Savings",
    description: "Earn interest on your deposits",
    icon: "savings",
  },
  {
    type: "Current",
    description: "For everyday transactions",
    icon: "account-balance",
  },
  {
    type: "Fixed Deposit",
    description: "Higher interest rates for fixed terms",
    icon: "lock",
  },
];

const NewAccountPage = () => {
  const router = useRouter();
  const isDarkMode = useColorScheme() === "dark";
  const { session, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedAccountNo, setGeneratedAccountNo] = useState<string>("");
  const [selectedAccountType, setSelectedAccountType] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      account_type: "",
      nickname: "",
      initial_deposit: "",
    },
  });

  const watchedAccountType = watch("account_type");

  // Generate a unique 12-digit account number
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

      if (error && !data) {
        // No rows returned, account number is unique
        isUnique = true;
      } else if (error) {
        console.error("Error checking account number:", error);
        throw new Error("Failed to validate account number");
      }
    }

    return accountNumber!;
  };

  const handleAccountTypeSelect = (type: string) => {
    setSelectedAccountType(type);
    setValue("account_type", type);
  };

  const onSubmit = async (data: any) => {
    const isAuthenticated = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to create account",
      fallbackLabel: "Enter PIN",
      cancelLabel: "Cancel",
    });
    if (!isAuthenticated.success) {
      Alert.alert("Authentication Failed", "You must authenticate to proceed.");
      return;
    }
    try {
      setLoading(true);

      if (!session?.user?.id) {
        Alert.alert("Error", "User session not found. Please log in again.");
        return;
      }

      const accountNumber = await generateAccountNumber();
      setGeneratedAccountNo(accountNumber);

      const accountData = {
        customer_id: user?.customer_id,
        account_no: accountNumber,
        account_type: data.account_type,
        balance: parseFloat(data.initial_deposit),
        account_status: "Pending",
        nickname: data.nickname.trim() || null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("Account").insert([accountData]);

      if (error) {
        console.error("Error creating account:", error);
        Alert.alert("Error", "Failed to create account. Please try again.");
        return;
      }

      Alert.alert(
        "Application Submitted!",
        `Your ${data.account_type} account application has been submitted successfully.\n\nAccount Number: ${accountNumber}\n\nYour account is currently pending approval and will be reviewed within 1-2 business days.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: Colors.light.themeColor,
        },
      ]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.dark.text }]}>
          Apply for New Account
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAwareScrollView
        style={[
          styles.scrollView,
          {
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
      >
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Select Account Type
          </Text>

          {ACCOUNT_TYPES.map((accountType) => (
            <TouchableOpacity
              key={accountType.type}
              style={[
                styles.accountTypeCard,
                {
                  backgroundColor: isDarkMode
                    ? Colors.dark.firstButton
                    : Colors.light.background,
                  borderColor:
                    selectedAccountType === accountType.type
                      ? isDarkMode
                        ? Colors.light.themeColorSecondary
                        : Colors.light.themeColor
                      : isDarkMode
                      ? Colors.dark.border
                      : Colors.light.border,
                  borderWidth: selectedAccountType === accountType.type ? 2 : 1,
                },
              ]}
              onPress={() => handleAccountTypeSelect(accountType.type)}
            >
              <View style={styles.accountTypeHeader}>
                <MaterialIcons
                  name={accountType.icon as any}
                  size={24}
                  color={
                    selectedAccountType === accountType.type
                      ? isDarkMode
                        ? Colors.light.themeColorSecondary
                        : Colors.light.themeColor
                      : isDarkMode
                      ? Colors.dark.text
                      : Colors.light.text
                  }
                />
                <Text
                  style={[
                    styles.accountTypeName,
                    {
                      color:
                        selectedAccountType === accountType.type
                          ? isDarkMode
                            ? Colors.light.themeColorSecondary
                            : Colors.light.themeColor
                          : isDarkMode
                          ? Colors.dark.text
                          : Colors.light.text,
                    },
                  ]}
                >
                  {accountType.type}
                </Text>
                {selectedAccountType === accountType.type && (
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color={
                      isDarkMode
                        ? Colors.light.themeColorSecondary
                        : Colors.light.themeColor
                    }
                  />
                )}
              </View>
              <Text
                style={[
                  styles.accountTypeDescription,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                ]}
              >
                {accountType.description}
              </Text>
            </TouchableOpacity>
          ))}

          {errors.account_type && (
            <Text style={styles.errorText}>{errors.account_type.message}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Initial Deposit (Dev Environment Only)
          </Text>

          <Controller
            control={control}
            name="initial_deposit"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode
                      ? Colors.dark.firstButton
                      : Colors.light.background,
                    borderColor: errors.initial_deposit
                      ? "red"
                      : isDarkMode
                      ? Colors.dark.border
                      : Colors.light.border,
                    color: isDarkMode ? Colors.dark.text : Colors.light.text,
                  },
                ]}
                placeholder="Enter amount (e.g., 1000)"
                placeholderTextColor={
                  isDarkMode
                    ? Colors.dark.text + "80"
                    : Colors.light.text + "80"
                }
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
              />
            )}
          />

          {errors.initial_deposit && (
            <Text style={styles.errorText}>
              {errors.initial_deposit.message}
            </Text>
          )}

          <Text
            style={[
              styles.helperText,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            This amount will be your account's opening balance
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Account Nickname (Optional)
          </Text>

          <Controller
            control={control}
            name="nickname"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode
                      ? Colors.dark.firstButton
                      : Colors.light.background,
                    borderColor: errors.nickname
                      ? "red"
                      : isDarkMode
                      ? Colors.dark.border
                      : Colors.light.border,
                    color: isDarkMode ? Colors.dark.text : Colors.light.text,
                  },
                ]}
                placeholder="e.g., Emergency Fund, Travel Savings"
                placeholderTextColor={
                  isDarkMode
                    ? Colors.dark.text + "80"
                    : Colors.light.text + "80"
                }
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={20}
              />
            )}
          />

          {errors.nickname && (
            <Text style={styles.errorText}>{errors.nickname.message}</Text>
          )}

          <Text
            style={[
              styles.helperText,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Give your account a friendly name for easy identification
          </Text>
        </View>

        {watchedAccountType && (
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: isDarkMode
                  ? Colors.dark.firstButton
                  : Colors.light.background,
                borderColor: Colors.light.themeColor,
              },
            ]}
          >
            <Text
              style={[
                styles.summaryTitle,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
              ]}
            >
              Application Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                ]}
              >
                Account Type:
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: isDarkMode
                      ? Colors.dark.themeColorSecondary
                      : Colors.light.themeColor,
                  },
                ]}
              >
                {watchedAccountType}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                ]}
              >
                Status:
              </Text>
              <Text style={[styles.summaryValue, { color: "orange" }]}>
                Pending Approval
              </Text>
            </View>

            {watch("nickname")?.trim() && (
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Nickname:
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: isDarkMode
                        ? Colors.dark.themeColorSecondary
                        : Colors.light.themeColor,
                    },
                  ]}
                >
                  {watch("nickname")}
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.summaryNote,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
              ]}
            >
              Your account will be reviewed and activated within 1-2 business
              days.
            </Text>
          </View>
        )}
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: loading
                ? Colors.light.themeColor + "80"
                : Colors.light.themeColor,
            },
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="white" />
              <Text style={styles.submitButtonText}>Submit Application</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  accountTypeCard: {
    padding: 20,
    paddingBottom: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  accountTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  accountTypeName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  accountTypeDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  minBalanceText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryNote: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 10,
    fontStyle: "italic",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "transparent",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NewAccountPage;
