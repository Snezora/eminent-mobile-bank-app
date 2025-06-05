import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  useColorScheme,
} from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import Colors from "@/src/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/src/providers/AuthProvider";
import * as yup from "yup";
import Animated from "react-native-reanimated";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { Customer } from "@/assets/data/types";
import fetchListofCustomers from "@/src/providers/fetchListofCustomers";
import { supabase } from "@/src/lib/supabase";

const editableForm = yup.object({
  account_no: yup
    .string()
    .required("Account number is required")
    .min(12, "Account number must be 12 digits")
    .max(12, "Account number must be 12 digits")
    .matches(/^[0-9]+$/, "Account number must be numeric"),
  customer_id: yup.string().required("Customer ID is required"),
  account_type: yup.string().required("Account type is required"),
  balance: yup.number().default(0).required("Balance is required"),
  account_status: yup
    .string()
    .default("Pending")
    .required("Account status is required"),
  nickname: yup.string(),
  approved_at: yup.date().nullable(),
  created_at: yup.date().default(() => new Date()),
});

const AccountStatusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Active", value: "Active" },
  { label: "Deactivated", value: "Deactivated" },
  { label: "Blocked", value: "Blocked" },
  { label: "None", value: null },
];

const AccountTypeOptions = [
  { label: "Savings", value: "Savings" },
  { label: "Checking", value: "Checking" },
  { label: "Credit", value: "Credit" },
];

const AddAccountScreen = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editableForm),
  });
  const onSubmit = async (data) => {
    try {
      const { data: accountData, error } = await supabase
        .from("Account")
        .insert([
          {
            account_no: data.account_no,
            customer_id: data.customer_id,
            account_type: data.account_type,
            balance: parseFloat(data.balance),
            account_status: data.account_status,
            nickname: data.nickname,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Account created successfully!", [{ text: "OK" }]);
      router.dismiss();
      router.push("/(admin)/accounts");
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      const customerList = await fetchListofCustomers();
      const updatedCustomers = customerList.map((customer) => ({
        ...customer,
        full_name: `${customer.first_name} ${customer.last_name} (${customer.customer_id})`,
      }));
      setCustomers(updatedCustomers);
    };

    fetchCustomers();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isDarkMode
            ? Colors.dark.themeColor
            : Colors.light.themeColor,
        }}
        edges={["top"]}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
          }}
        >
          <View
            style={{
              paddingHorizontal: 10,
              paddingBottom: 10,
              paddingTop: 10,
              backgroundColor: Colors.light.themeColor,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                flex: 1,
                alignItems: "center",
              }}
            >
              <TouchableOpacity activeOpacity={0} onPress={() => router.back()}>
                <Ionicons name="chevron-back-outline" size={24} color="white" />
              </TouchableOpacity>
              <Text
                style={{ fontSize: 24, fontWeight: "bold", color: "white" }}
              >
                Add New Account
              </Text>
            </View>
          </View>
          <Animated.ScrollView
            style={[
              styles.mainPage,
              {
                paddingTop: 40,
                backgroundColor: isDarkMode
                  ? Colors.dark.background
                  : Colors.light.background,
              },
            ]}
          >
            <View style={styles.mainContainer}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text
                      style={[
                        styles.inputTitle,
                        {
                          color: isDarkMode
                            ? Colors.dark.text
                            : Colors.light.themeColor,
                        },
                      ]}
                    >
                      Account Number
                    </Text>
                    <TextInput
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value ?? ""}
                      placeholder="Enter Account Number"
                      placeholderTextColor={Colors.light.themeColor}
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDarkMode
                            ? Colors.light.background
                            : "white",
                        },
                      ]}
                      inputMode="numeric"
                      keyboardType="numeric"
                    />
                  </View>
                )}
                name="account_no"
              />
              {errors.account_no && (
                <Text style={styles.error}>{errors.account_no.message}</Text>
              )}
            </View>
            <View style={styles.mainContainer}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text
                      style={[
                        styles.inputTitle,
                        {
                          color: isDarkMode
                            ? Colors.dark.text
                            : Colors.light.themeColor,
                        },
                      ]}
                    >
                      Customer
                    </Text>
                    <Dropdown
                      onBlur={onBlur}
                      value={value}
                      onChange={(item) => {
                        onChange(item.customer_id);
                      }}
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDarkMode
                            ? Colors.light.background
                            : "white",
                        },
                      ]}
                      data={customers}
                      labelField={"full_name"}
                      valueField={"customer_id"}
                      placeholder="Select Customer"
                    />
                  </View>
                )}
                name="customer_id"
              />
              {errors.customer_id && (
                <Text style={styles.error}>{errors.customer_id.message}</Text>
              )}
            </View>
            <View style={styles.mainContainer}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text
                      style={[
                        styles.inputTitle,
                        {
                          color: isDarkMode
                            ? Colors.dark.text
                            : Colors.light.themeColor,
                        },
                      ]}
                    >
                      Account Type
                    </Text>
                    <Dropdown
                      onBlur={onBlur}
                      value={value}
                      onChange={(item) => onChange(item.value)}
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: isDarkMode
                            ? Colors.light.background
                            : "white",
                        },
                      ]}
                      data={AccountTypeOptions}
                      labelField="label"
                      valueField="value"
                      placeholder="Select Account Type"
                    />
                  </View>
                )}
                name="account_type"
              />
              {errors.account_type && (
                <Text style={styles.error}>{errors.account_type.message}</Text>
              )}
            </View>
            <View style={styles.mainContainer}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text
                      style={[
                        styles.inputTitle,
                        {
                          color: isDarkMode
                            ? Colors.dark.text
                            : Colors.light.themeColor,
                        },
                      ]}
                    >
                      Balance
                    </Text>
                    <TextInput
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value?.toString() ?? ""}
                      placeholderTextColor={
                        isDarkMode
                          ? Colors.dark.themeColor
                          : Colors.light.themeColor
                      }
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDarkMode
                            ? Colors.light.background
                            : "white",
                        },
                      ]}
                      inputMode="numeric"
                      keyboardType="numeric"
                    />
                  </View>
                )}
                name="balance"
                defaultValue={0}
              />
              {errors.balance && (
                <Text style={styles.error}>{errors.balance.message}</Text>
              )}
            </View>
            <View style={styles.mainContainer}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text
                      style={[
                        styles.inputTitle,
                        {
                          color: isDarkMode
                            ? Colors.dark.text
                            : Colors.light.themeColor,
                        },
                      ]}
                    >
                      Account Status
                    </Text>
                    <Dropdown
                      onBlur={onBlur}
                      value={value}
                      data={AccountStatusOptions}
                      labelField="label"
                      valueField="value"
                      onChange={(item) => onChange(item.value)}
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDarkMode
                            ? Colors.light.background
                            : "white",
                        },
                      ]}
                    />
                  </View>
                )}
                defaultValue={
                  AccountStatusOptions.find(
                    (option) => option.value === "Pending"
                  )?.value ?? ""
                }
                name="account_status"
              />
              {errors.account_status && (
                <Text style={styles.error}>
                  {errors.account_status.message}
                </Text>
              )}
            </View>
            <View style={styles.mainContainer}>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text
                      style={[
                        styles.inputTitle,
                        {
                          color: isDarkMode
                            ? Colors.dark.text
                            : Colors.light.themeColor,
                        },
                      ]}
                    >
                      Nickname
                    </Text>
                    <TextInput
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value ?? ""}
                      placeholderTextColor={
                        isDarkMode
                          ? Colors.dark.themeColor
                          : Colors.light.themeColor
                      }
                      placeholder="Enter Nickname (optional)"
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDarkMode
                            ? Colors.light.background
                            : "white",
                        },
                      ]}
                    />
                  </View>
                )}
                name="nickname"
              />
            </View>
            <TouchableOpacity
              style={{
                marginTop: 10,
                backgroundColor: Colors.light.themeColor,
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 20,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
              onPress={handleSubmit((data) => {
                Alert.alert(
                  "Confirm Submission",
                  "Are you sure you want to add this account?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        void onSubmit(data);
                      },
                    },
                  ]
                );
              })}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Add new account
              </Text>
            </TouchableOpacity>
          </Animated.ScrollView>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  mainPage: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  mainContainer: {
    marginBottom: 10,
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
  inputContainer: {
    borderWidth: 2,
    borderColor: Colors.light.themeColor,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    minHeight: 50,
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
    marginBottom: 10,
  },
});

export default AddAccountScreen;
