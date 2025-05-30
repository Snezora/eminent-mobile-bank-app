import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import Colors from "@/src/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller, useWatch } from "react-hook-form";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Animated from "react-native-reanimated";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { Account, Customer } from "@/assets/data/types";
import fetchListofCustomers from "@/src/providers/fetchListofCustomers";
import { supabase } from "@/src/lib/supabase";
import fetchListofAccounts from "@/src/providers/fetchListofAccounts";

const editableForm = yup.object({
  customer_id: yup.string().required("Customer is required"),
  customer_annual_income: yup.number().required("Annual income is required"),
  customer_job_company_name: yup.string(),
  customer_job_title: yup.string(),
  customer_job_years: yup.number().required("Years of employment is required"),
  customer_home_ownership: yup.string().required("Home ownership is required"),
  loan_intent: yup.string().required("Loan intent is required"),
  loan_grade: yup.string().required("Loan grade is required"),
  loan_interest_rate: yup.number().required("Interest rate is required"),
  customer_credit_score: yup
    .number()
    .required("Credit score is required")
    .min(300, "Credit score must be at least 300")
    .max(850, "Credit score must be at most 850"),
  customer_credit_history_years: yup
    .number()
    .required("Credit history years is required"),
  customer_default: yup.boolean().required("Default status is required"),
  loan_amount: yup
    .number()
    .required("Loan amount is required")
    .min(0, "Loan amount must be a positive number"),
  account_no: yup.string(),
});

const AccountStatusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Active", value: "Active" },
  { label: "Blocked", value: "Blocked" },
  { label: "None", value: null },
];

const AccountTypeOptions = [
  { label: "Savings", value: "Savings" },
  { label: "Checking", value: "Checking" },
  { label: "Credit", value: "Credit" },
];

const AddLoanPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(editableForm),
  });
  const onSubmit = async (data) => {
    try {
      const { data: newLoan, error } = await supabase
        .from("Loan")
        .insert({
          customer_id: data.customer_id,
          customer_annual_income: data.customer_annual_income,
          customer_job_company_name: data.customer_job_company_name,
          customer_job_title: data.customer_job_title,
          customer_job_years: data.customer_job_years,
          customer_home_ownership: data.customer_home_ownership,
          loan_intent: data.loan_intent,
          loan_grade: data.loan_grade,
          loan_interest_rate: data.loan_interest_rate,
          customer_credit_score: data.customer_credit_score,
          customer_credit_history_years: data.customer_credit_history_years,
          customer_default: data.customer_default,
          loan_amount: data.loan_amount,
          account_no: data.account_no,
        })
        .select("*")
        .single();

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

  const customerId = useWatch({
    control,
    name: "customer_id",
  });

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

useEffect(() => {
  if (!customerId) return;

  const fetchAccounts = fetchListofAccounts({
    isMockEnabled: false, 
    isAdmin: true,
    customer_id: customerId,
  });

  fetchAccounts
    .then((fetchedAccounts) => {
      const updatedAccounts = (fetchedAccounts ?? []).map((account) => ({
        ...account,
        full_name: `${account.account_no} ${account.nickname || ""}`.trim(),
      }));
      
      setAccounts(updatedAccounts);
    })
    .catch((error) => {
      console.error("Error fetching accounts:", error);
    });
}, [customerId]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Colors.light.themeColor }}
        edges={["top"]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
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
                <TouchableOpacity
                  activeOpacity={0}
                  onPress={() => router.back()}
                >
                  <Ionicons
                    name="chevron-back-outline"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "white" }}
                >
                  Add New Loan
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.light.background,
              }}
            >
              <Animated.ScrollView
                style={styles.mainPage}
                showsVerticalScrollIndicator
                contentContainerStyle={{ paddingBottom: 50, paddingTop: 20 }}
                scrollsToTop
                indicatorStyle="black"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                bounces={false}
                scrollIndicatorInsets={{ right: 1 }}
              >
                <View style={styles.mainContainer}>
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Customer</Text>
                        <Dropdown
                          style={styles.inputContainer}
                          data={customers}
                          labelField="full_name"
                          valueField="customer_id"
                          placeholder="Select a customer"
                          value={value}
                          onChange={(item) => onChange(item.customer_id)}
                          onBlur={onBlur}
                          dropdownPosition="auto"
                        />
                      </View>
                    )}
                    name="customer_id"
                  />
                  {errors.customer_id && (
                    <Text style={styles.error}>
                      {errors.customer_id.message}
                    </Text>
                  )}
                                    {customerId && (
                    <>
                      <Controller
                        control={control}
                        rules={{
                          required: true,
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <View style={{ gap: 5 }}>
                            <Text style={styles.inputTitle}>
                              Account Number
                            </Text>
                            <Dropdown
                              style={styles.inputContainer}
                              data={accounts}
                              labelField="full_name"
                              valueField="account_no"
                              placeholder="Select an account"
                              value={value}
                              onChange={(item) => onChange(item.account_no)}
                              onBlur={onBlur}
                            />
                          </View>
                        )}
                        name="account_no"
                      />
                      {errors.account_no && (
                        <Text style={styles.error}>
                          {errors.account_no.message}
                        </Text>
                      )}
                    </>
                  )}
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Annual Income</Text>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value?.toString() ?? ""}
                          placeholderTextColor={Colors.light.themeColor}
                          style={styles.input}
                          inputMode="numeric"
                          keyboardType="numeric"
                          placeholder="Enter annual income"
                        />
                      </View>
                    )}
                    name="customer_annual_income"
                  />
                  {errors.customer_annual_income && (
                    <Text style={styles.error}>
                      {errors.customer_annual_income.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Company Name</Text>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value ?? ""}
                          placeholderTextColor={Colors.light.themeColor}
                          style={styles.input}
                          placeholder="Enter company name"
                        />
                      </View>
                    )}
                    name="customer_job_company_name"
                  />
                  {errors.customer_job_company_name && (
                    <Text style={styles.error}>
                      {errors.customer_job_company_name.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Job Title</Text>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value ?? ""}
                          placeholderTextColor={Colors.light.themeColor}
                          style={styles.input}
                          placeholder="Enter job title"
                        />
                      </View>
                    )}
                    name="customer_job_title"
                  />
                  {errors.customer_job_title && (
                    <Text style={styles.error}>
                      {errors.customer_job_title.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>
                          Years of Employment
                        </Text>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value?.toString() ?? ""}
                          placeholderTextColor={Colors.light.themeColor}
                          style={styles.input}
                          inputMode="numeric"
                          keyboardType="numeric"
                          placeholder="Enter years of employment"
                        />
                      </View>
                    )}
                    name="customer_job_years"
                  />
                  {errors.customer_job_years && (
                    <Text style={styles.error}>
                      {errors.customer_job_years.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Home Ownership</Text>
                        <Dropdown
                          style={styles.inputContainer}
                          data={[
                            { label: "Own", value: "OWN" },
                            { label: "Rent", value: "RENT" },
                            { label: "Mortgage", value: "MORTGAGE" },
                            { label: "Other", value: "OTHER" },
                          ]}
                          labelField="label"
                          valueField="value"
                          placeholder="Select home ownership"
                          value={value}
                          onChange={(item) => onChange(item.value)}
                          onBlur={onBlur}
                        />
                      </View>
                    )}
                    name="customer_home_ownership"
                  />
                  {errors.customer_home_ownership && (
                    <Text style={styles.error}>
                      {errors.customer_home_ownership.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Loan Intent</Text>
                        <Dropdown
                          style={styles.inputContainer}
                          data={[
                            {
                              label: "Debt Consolidation",
                              value: "DEBTCONSOLIDATION",
                            },
                            {
                              label: "Home Improvement",
                              value: "HOMEIMPROVEMENT",
                            },
                            { label: "Education Purposes", value: "EDUCATION" },
                            { label: "Medical Expenses", value: "MEDICAL" },
                            { label: "Personal Loan", value: "PERSONAL" },
                            { label: "Business Loan", value: "VENTURE" },
                            { label: "Other", value: "Other" },
                          ]}
                          labelField="label"
                          valueField="value"
                          placeholder="Select loan intent"
                          value={value}
                          onChange={(item) => onChange(item.value)}
                          onBlur={onBlur}
                        />
                      </View>
                    )}
                    name="loan_intent"
                  />
                  {errors.loan_intent && (
                    <Text style={styles.error}>
                      {errors.loan_intent.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Loan Grade</Text>
                        <Dropdown
                          style={styles.inputContainer}
                          data={[
                            { label: "A", value: "A" },
                            { label: "B", value: "B" },
                            { label: "C", value: "C" },
                            { label: "D", value: "D" },
                            { label: "E", value: "E" },
                            { label: "F", value: "F" },
                            { label: "G", value: "G" },
                          ]}
                          labelField="label"
                          valueField="value"
                          placeholder="Select loan grade"
                          value={value}
                          onChange={(item) => onChange(item.value)}
                          onBlur={onBlur}
                        />
                      </View>
                    )}
                    name="loan_grade"
                  />
                  {errors.loan_grade && (
                    <Text style={styles.error}>
                      {errors.loan_grade.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Interest Rate</Text>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value?.toString() ?? ""}
                          placeholderTextColor={Colors.light.themeColor}
                          style={styles.input}
                          inputMode="numeric"
                          keyboardType="numeric"
                          placeholder="Enter interest rate"
                        />
                      </View>
                    )}
                    name="loan_interest_rate"
                  />
                  {errors.loan_interest_rate && (
                    <Text style={styles.error}>
                      {errors.loan_interest_rate.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Credit Score</Text>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value?.toString() ?? ""}
                          placeholderTextColor={Colors.light.themeColor}
                          style={styles.input}
                          inputMode="numeric"
                          keyboardType="numeric"
                          placeholder="Enter credit score"
                        />
                      </View>
                    )}
                    name="customer_credit_score"
                  />
                  {errors.customer_credit_score && (
                    <Text style={styles.error}>
                      {errors.customer_credit_score.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>
                          Credit History Years
                        </Text>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value?.toString() ?? ""}
                          placeholderTextColor={Colors.light.themeColor}
                          style={styles.input}
                          inputMode="numeric"
                          keyboardType="numeric"
                          placeholder="Enter credit history years"
                        />
                      </View>
                    )}
                    name="customer_credit_history_years"
                  />
                  {errors.customer_credit_history_years && (
                    <Text style={styles.error}>
                      {errors.customer_credit_history_years.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Default Status</Text>
                        <Dropdown
                          style={styles.inputContainer}
                          data={[
                            { label: "Yes", value: true },
                            { label: "No", value: false },
                          ]}
                          labelField="label"
                          valueField="value"
                          placeholder="Select default status"
                          value={value}
                          onChange={(item) => onChange(item.value)}
                          onBlur={onBlur}
                        />
                      </View>
                    )}
                    name="customer_default"
                  />
                  {errors.customer_default && (
                    <Text style={styles.error}>
                      {errors.customer_default.message}
                    </Text>
                  )}
                  <Controller
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ gap: 5 }}>
                        <Text style={styles.inputTitle}>Loan Amount</Text>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value?.toString() ?? ""}
                          placeholderTextColor={Colors.light.themeColor}
                          style={styles.input}
                          inputMode="numeric"
                          keyboardType="numeric"
                          placeholder="Enter loan amount"
                        />
                      </View>
                    )}
                    name="loan_amount"
                  />
                  {errors.loan_amount && (
                    <Text style={styles.error}>
                      {errors.loan_amount.message}
                    </Text>
                  )}
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
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  mainPage: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 50,
    paddingTop: 10,
  },
  mainContainer: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.themeColor,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    borderWidth: 2,
    borderColor: Colors.light.themeColor,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
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
    marginBottom: 15,
    marginTop: -10,
  },
});

export default AddLoanPage;
