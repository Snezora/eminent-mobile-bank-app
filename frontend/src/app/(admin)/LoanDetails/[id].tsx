import Colors from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Button,
  Alert,
  useColorScheme,
} from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { loans } from "@/assets/data/dummyLoans";
import { customers } from "@/assets/data/dummyCustomers";
import { useEffect, useState } from "react";
import { Loan, Customer } from "@/assets/data/types";
import fetchLoanDetails from "@/src/providers/fetchLoanDetails";
import { fetchCustomerDetails } from "@/src/providers/fetchCustomerDetails";
import dayjs from "dayjs";
import Modal from "react-native-modal";
import { Image } from "expo-image";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Dropdown } from "react-native-element-dropdown";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";

const editableForm = yup.object({
  creditHistory: yup.number().required("Credit history is required"),
  creditScore: yup
    .number()
    .required("Credit score is required")
    .min(300)
    .max(850),
  defaultStatus: yup.boolean().required("Default status is required"),
  loanGrade: yup.string().required("Loan grade is required"),
  interestRate: yup.number().required("Interest rate is required"),
});

const LoanDetails = () => {
  const { id } = useLocalSearchParams();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [approveColor, setApproveColor] = useState("green");
  const [approveText, setApproveText] = useState("Not Decided");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  // Use this for both IC and Passport
  const [isIC, setIsIC] = useState(false);
  const [isPayslip, setIsPayslip] = useState(false);
  const [isUtilityBill, setIsUtilityBill] = useState(false);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [isEditLoan, setIsEditLoan] = useState(false);
  const [isAIPrediction, setIsAIPrediction] = useState(false);
  const backendUrl = process.env.EXPO_PUBLIC_LOCALTUNNEL_URL;
  const [loanPrediction, setLoanPrediction] = useState<{
    prediction?: number;
    shap_values?: Record<string, number>;
  }>({});
  const [shouldPredict, setShouldPredict] = useState(false);
  const [loanPredicting, setLoanPredicting] = useState(false);
  const { user, isMockEnabled } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const loanGrade = [
    {
      label: "A",
      value: "A",
    },
    {
      label: "B",
      value: "B",
    },
    {
      label: "C",
      value: "C",
    },
    {
      label: "D",
      value: "D",
    },
    {
      label: "E",
      value: "E",
    },
    {
      label: "F",
      value: "F",
    },
  ];

  const trueFalse = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editableForm),
  });
  const onSubmit = async (data) => {
    const { data: response, error } = await supabase
      .from("Loan")
      .update({
        customer_credit_history_years: data.creditHistory,
        customer_credit_score: data.creditScore,
        customer_default: data.defaultStatus,
        loan_grade: data.loanGrade,
        loan_interest_rate: data.interestRate,
      })
      .eq("loan_id", id)
      .select();
    setIsAIPrediction(false);
    const fetchedLoan = await fetchLoanDetails(
      isMockEnabled ?? false,
      id as string
    );
    setLoan(Array.isArray(fetchedLoan) ? fetchedLoan[0] : fetchedLoan);

    setShouldPredict(true);
    setTextModalVisible(false);
    setIsEditLoan(false);
  };

  useEffect(() => {
    const fetchLoan = async () => {
      const fetchedLoan = await fetchLoanDetails(
        isMockEnabled ?? false,
        id as string
      );
      setLoan(Array.isArray(fetchedLoan) ? fetchedLoan[0] : fetchedLoan);

      console.log("Loan: ", loan);

      if (!fetchedLoan) {
        router.replace("/(admin)/loans");
      }
    };

    const fetchData = async () => {
      await fetchLoan();
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (loan?.customer_id) {
      fetchCustomerDetails(isMockEnabled ?? false, loan.customer_id).then(
        setCustomer
      );
    }
    if (loan?.final_approval === null) {
      setApproveText("Not Decided");
      setApproveColor(Colors.light.themeColor);
    } else if (loan?.final_approval === true) {
      setApproveText("Approved");
      setApproveColor("green");
    } else if (loan?.final_approval === false) {
      setApproveText("Rejected");
      setApproveColor(Colors.light.themeColorReject);
    }
  }, [loan]);

  useEffect(() => {
    if (
      (loan && customer && loan.ai_prediction === null) ||
      shouldPredict ||
      isMockEnabled
    ) {
      requestAIPrediction().then(() => {
        setShouldPredict(false);
        setLoanPredicting(false);
      });
      setShouldPredict(false);
    }
    if ((loan && customer && loan.ai_prediction !== null) || !isMockEnabled) {
      setLoanPrediction(loan && loan.ai_prediction ? loan.ai_prediction : {});
    }
  }, [shouldPredict, loan, customer]);

  useEffect(() => {
    if (isMockEnabled) {
      // Do nothing if mock mode is enabled
      return;
    }

    if (loanPrediction && loanPrediction.prediction !== undefined) {
      const updatePrediction = async () => {
        await supabase
          .from("Loan")
          .update({ ai_prediction: loanPrediction })
          .eq("loan_id", id)
          .select();
        setLoading(false);
      };
      updatePrediction();
    }
  }, [loanPrediction]);

  const requestAIPrediction = async () => {
    if (!loan || !customer) return;
    setLoanPredicting(true);

    const person_age = customer.date_of_birth
      ? dayjs().diff(dayjs(customer.date_of_birth), "year")
      : 30;

    // Provide default values for null fields
    const body = {
      person_age,
      person_income: loan.customer_annual_income,
      person_home_ownership: loan.customer_home_ownership,
      person_emp_length: loan.customer_job_years || 0,
      loan_intent: loan.loan_intent,
      loan_grade: loan.loan_grade || "C", // Default to 'C' grade
      loan_amnt: loan.loan_amount,
      loan_int_rate: loan.loan_interest_rate || 10.0, // Default interest rate
      cb_person_default_on_file: loan.customer_default ?? false, // Default to false
      cb_person_cred_hist_length: loan.customer_credit_history_years || 0,
    };

    console.log("AI Prediction Body:", body); // Add this for debugging

    try {
      const response = await fetch(`${backendUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("AI Prediction Result:", result); // Add this for debugging
      setLoanPrediction(result);
    } catch (error) {
      console.error("Prediction error:", error);
      // Set a fallback prediction to prevent infinite loading
      setLoanPrediction({ prediction: 0.5, shap_values: {} });
    } finally {
      setLoanPredicting(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.light.themeColor }}
      edges={["top"]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={1}>
          <Ionicons name="chevron-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          Back To Loans
        </Text>
      </View>
      {loading && (
        <Animated.View
          exiting={FadeOut.duration(1000)}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
          }}
        >
          <ActivityIndicator
            size="large"
            color={isDarkMode ? "white" : Colors.light.themeColor}
            style={{ marginBottom: 20 }}
          />
        </Animated.View>
      )}
      {!loading && (
        <Animated.ScrollView
          style={[
            styles.container,
            {
              backgroundColor: isDarkMode
                ? Colors.dark.background
                : Colors.light.background,
            },
          ]}
          bounces={false}
        >
          <View
            style={[
              styles.containerHeader,
              {
                borderBottomColor:
                  loan?.final_approval === null
                    ? Colors.light.themeColor
                    : loan?.final_approval
                    ? "green"
                    : Colors.light.themeColorReject,
              },
            ]}
          >
            <View
              style={{ justifyContent: "space-between", flexDirection: "row" }}
            >
              <Text style={[styles.containerHeaderText]}>Loan ID: # {id}</Text>
              <Text style={styles.containerHeaderText}>
                {dayjs(loan?.application_date).format("DD/MM/YYYY")}
              </Text>
            </View>
            <View
              style={{ justifyContent: "space-between", flexDirection: "row" }}
            >
              <Text style={styles.containerHeaderText}>
                Amount: USD {loan?.loan_amount.toFixed(2)}
              </Text>
              <View
                style={{
                  backgroundColor: approveColor,
                  paddingHorizontal: 5,
                  borderRadius: 5,
                }}
              >
                <Text style={[styles.containerHeaderText]}>{approveText}</Text>
              </View>
            </View>
          </View>
          <View style={styles.customerDetailsContainer}>
            <View style={[styles.customerHalfContainer, { maxWidth: "70%" }]}>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Full Name: {customer?.first_name} {customer?.last_name}
              </Text>
              {customer?.ic_no ? (
                <Text
                  style={[
                    styles.customerDetailsText,
                    { color: isDarkMode ? Colors.dark.text : "#000" },
                  ]}
                >
                  IC No: {customer?.ic_no}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.customerDetailsText,
                    { color: isDarkMode ? Colors.dark.text : "#000" },
                  ]}
                >
                  Passport No: {customer?.passport_no}
                </Text>
              )}
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Age:{" "}
                {customer?.date_of_birth
                  ? dayjs().diff(dayjs(customer.date_of_birth), "year")
                  : "N/A"}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Nationality: {customer?.nationality}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Phone No: {customer?.phone_no}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Company Name: {loan?.customer_job_company_name}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Occupation: {loan?.customer_job_title}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Experience: {loan?.customer_job_years} Years
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Home Address: {customer?.home_address}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Home Ownership: {loan?.customer_home_ownership}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Annual Income: USD {loan?.customer_annual_income}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Credit History: {loan?.customer_credit_history_years} Years
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Credit Score: {loan?.customer_credit_score}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Default Status: {loan?.customer_default ? "Yes" : "No"}
              </Text>
            </View>
            <View
              style={[
                styles.customerHalfContainer,
                { maxWidth: "40%", alignItems: "center", width: "auto" },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.buttonContainer,
                  { backgroundColor: Colors.light.themeColor },
                ]}
                onPress={() => {
                  setImageModalVisible(true);
                  setIsIC(true);
                }}
              >
                <Text style={styles.buttonText}>
                  View {customer?.ic_no ? "IC" : "Passport"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.buttonContainer,
                  { backgroundColor: Colors.light.themeColor },
                ]}
                onPress={() => {
                  setImageModalVisible(true);
                  setIsPayslip(true);
                }}
              >
                <Text style={styles.buttonText}>View Payslip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.buttonContainer,
                  { backgroundColor: Colors.light.themeColor },
                ]}
                onPress={() => {
                  setImageModalVisible(true);
                  setIsUtilityBill(true);
                }}
              >
                <Text style={styles.buttonText}>View Utility Bill</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.buttonContainer,
                  { backgroundColor: Colors.light.themeColor },
                ]}
                onPress={() => {
                  setTextModalVisible(true);
                  setIsEditLoan(true);
                }}
              >
                <Text style={styles.buttonText}>Edit Loan Details</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={[{ height: 3, backgroundColor: Colors.light.themeColor }]}
          />
          <View style={styles.customerDetailsContainer}>
            <View style={[styles.customerHalfContainer, { maxWidth: "70%" }]}>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Acc. No: {loan?.account_number}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Loan Intent: {loan?.loan_intent}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Loan Grade: {loan?.loan_grade}
              </Text>
              <Text
                style={[
                  styles.customerDetailsText,
                  { color: isDarkMode ? Colors.dark.text : "#000" },
                ]}
              >
                Interest Rate: {loan?.loan_interest_rate?.toFixed(2)}%
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.customerHalfContainer,
                {
                  maxWidth: "40%",
                  alignItems: "center",
                  width: "auto",
                  justifyContent: "center",
                  opacity: loanPredicting ? 0.3 : 1,
                },
              ]}
              onPress={() => {
                if (loanPredicting) return;
                setTextModalVisible(true);
                setIsAIPrediction(true);
              }}
              disabled={loanPredicting}
            >
              <View
                style={[
                  styles.buttonContainer,
                  {
                    borderColor:
                      (loanPrediction.prediction ?? 0) > 0.5
                        ? "green"
                        : "#CC0000",
                    backgroundColor: Colors.light.themeColor,
                  },
                ]}
              >
                <Text style={styles.buttonText}>
                  {loanPredicting ? "Please Wait" : "View AI Decision"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* ADD LIKE A BUTTON TO THIS AND SHOW SHAP VALUES */}
          {loan?.final_approval === null && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <TouchableOpacity
                style={[
                  styles.predictionContainer,
                  {
                    borderColor: "#CC0000",
                    width: "35%",
                    justifyContent: "center",
                    backgroundColor: Colors.light.background,
                  },
                ]}
                onPress={async () => {
                  const { data, error } = await supabase
                    .from("Loan")
                    .update({ final_approval: false })
                    .eq("loan_id", id)
                    .select();

                  const { data: adminLoanData, error: adminLoanError } =
                    await supabase
                      .from("Admin_Loan")
                      .insert([
                        {
                          admin_id:
                            user && "admin_id" in user
                              ? (user as any).admin_id
                              : null,
                          loan_id: id,
                          admin_approve: false,
                        },
                      ])
                      .select();

                  // Refetch loan, which will update state and trigger useEffect
                  const fetchedLoan = await fetchLoanDetails(
                    isMockEnabled ?? false,
                    id as string
                  );
                  setLoan(
                    Array.isArray(fetchedLoan) ? fetchedLoan[0] : fetchedLoan
                  );
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.predictionText}>Reject</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.predictionContainer,
                  {
                    borderColor: "green",
                    width: "35%",
                    justifyContent: "center",
                    backgroundColor: Colors.light.background,
                  },
                ]}
                onPress={() => {
                  Alert.alert(
                    "Confirm Approval",
                    "Are you sure you want to approve this loan?",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Yes",
                        onPress: async () => {
                          const { data, error } = await supabase
                            .from("Loan")
                            .update({ final_approval: true })
                            .eq("loan_id", id)
                            .select();

                          const { data: adminLoanData, error: adminLoanError } =
                            await supabase
                              .from("Admin_Loan")
                              .insert([
                                {
                                  admin_id:
                                    user && "admin_id" in user
                                      ? (user as any).admin_id
                                      : null,
                                  loan_id: id,
                                  admin_approve: true,
                                },
                              ])
                              .select();

                          const fetchedLoan = await fetchLoanDetails(
                            isMockEnabled ?? false,
                            id as string
                          );
                          setLoan(
                            Array.isArray(fetchedLoan)
                              ? fetchedLoan[0]
                              : fetchedLoan
                          );
                        },
                      },
                    ]
                  );
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.predictionText}>Approve</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          {loan?.final_approval !== null && (
            <Text style={{ marginLeft: 20, marginTop: 10, color: "red" }}>
              Please contact server operator to change decision.
            </Text>
          )}
        </Animated.ScrollView>
      )}

      <StatusBar style="light" />
      <Modal
        style={styles.modal}
        isVisible={imageModalVisible}
        onBackdropPress={() => {
          setImageModalVisible(false);
          setIsIC(false);
          setIsPayslip(false);
          setIsUtilityBill(false);
        }}
        useNativeDriver={false}
        backdropTransitionOutTiming={0}
        animationIn={"slideInUp"}
        animationOut={"slideOutDown"}
      >
        <View
          style={{
            backgroundColor: Colors.light.background,
            minHeight: 450,
            paddingVertical: 30,
          }}
        >
          {isIC && (
            <Image
              contentFit="contain"
              source={
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh0OtwdFzchYKMwsTtS2VrWyOx6dic0c5kCuk8T30bFWk0wbcWj9kvlwalcRTyyCJRkI12mtoC5WYhWNaFvFCBMoR77Bk55tU79OByLd9GP2azrLgVUGIN3hA6J80sNj6QwLUqSWiGLkmI/s1600/KP+2001.jpg"
              }
              style={{ flex: 1, width: "100%" }}
            />
          )}
          {isUtilityBill && (
            <Image
              contentFit="cover"
              contentPosition={"top center"}
              source={"https://www.tnb.com.my/assets/images/2024_Bill.png"}
              style={{ flex: 1, width: "100%" }}
            ></Image>
          )}
          {isPayslip && (
            <Image
              contentFit="contain"
              responsivePolicy="live"
              source={
                "https://iflexi.asia/wp-content/uploads/2022/09/Payslip-2.jpg"
              }
              style={{ flex: 1, width: "100%" }}
            ></Image>
          )}
        </View>
      </Modal>
      <Modal
        style={styles.modal}
        isVisible={textModalVisible}
        onBackdropPress={() => {
          setTextModalVisible(false);
          setIsEditLoan(false);
          setIsAIPrediction(false);
        }}
        useNativeDriver={false}
        backdropTransitionOutTiming={0}
        animationIn={"slideInUp"}
        animationOut={"slideOutDown"}
      >
        {isEditLoan && (
          <>
            <ScrollView
              style={{
                backgroundColor: "white",
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderRadius: 10,
                maxHeight: "60%",
              }}
              // bounces={false}
              showsVerticalScrollIndicator
            >
              <Text style={styles.modalHeaderText}>Edit Loan Details</Text>
              <Controller
                control={control}
                rules={{
                  required: true,
                  validate: (v) => {
                    if (v === "" || v === undefined)
                      return "Credit history is required";
                    const num = Number(v);
                    if (isNaN(num)) return "Credit history must be a number";
                    if (num < 0 || num > 100)
                      return "Credit history must be between 0 and 100 years";
                    return true;
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text style={styles.inputTitle}>
                      Credit History (Years)
                    </Text>
                    <TextInput
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={
                        value !== undefined && value !== null
                          ? String(value)
                          : ""
                      }
                      editable={loan?.final_approval === null}
                      placeholderTextColor={Colors.light.themeColor}
                      style={[
                        styles.input,
                        loan?.final_approval !== null && { opacity: 0.7 },
                      ]}
                      inputMode="numeric"
                      keyboardType="numeric"
                    />
                  </View>
                )}
                defaultValue={
                  typeof loan?.customer_credit_history_years === "number"
                    ? loan.customer_credit_history_years
                    : undefined
                }
                name="creditHistory"
              />
              {errors.creditHistory && (
                <Text style={styles.error}>
                  {errors.creditHistory?.message}
                </Text>
              )}
              <Controller
                control={control}
                rules={{
                  required: true,
                  validate: (v) => {
                    if (v === "" || v === undefined)
                      return "Credit score is required";
                    const num = Number(v);
                    if (isNaN(num)) return "Credit score must be a number";
                    if (num < 300 || num > 850)
                      return "Credit score must be between 300 and 850";
                    return true;
                  },
                }}
                disabled={loan?.final_approval !== null}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text style={styles.inputTitle}>Credit Score</Text>
                    <TextInput
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value ?? ""}
                      editable={loan?.final_approval === null}
                      placeholderTextColor={Colors.light.themeColor}
                      style={[
                        styles.input,
                        loan?.final_approval !== null && { opacity: 0.7 },
                      ]}
                      inputMode="numeric"
                      keyboardType="numeric"
                    />
                  </View>
                )}
                defaultValue={
                  typeof loan?.customer_credit_score === "number"
                    ? String(loan.customer_credit_score)
                    : ""
                }
                name="creditScore"
              />
              {errors.creditScore && (
                <Text style={styles.error}>{errors.creditScore?.message}</Text>
              )}
              <Controller
                control={control}
                rules={{ required: true, max: 30 }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text style={styles.inputTitle}>Loan Grade</Text>
                    <Dropdown
                      onChange={(text) => onChange(text.value)}
                      onBlur={onBlur}
                      disable={loan?.final_approval !== null}
                      value={value}
                      data={loanGrade}
                      labelField={"label"}
                      valueField={"value"}
                      style={[
                        styles.input,
                        loan?.final_approval !== null && { opacity: 0.7 },
                      ]}
                    />
                  </View>
                )}
                defaultValue={loan?.loan_grade ?? undefined}
                name="loanGrade"
              />
              {errors.loanGrade && (
                <Text style={styles.error}>{errors.loanGrade?.message}</Text>
              )}
              <Controller
                control={control}
                rules={{ required: true, max: 30 }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text style={styles.inputTitle}>Default Status</Text>
                    <Dropdown
                      onChange={(text) => onChange(text.value)}
                      onBlur={onBlur}
                      disable={loan?.final_approval !== null}
                      value={value}
                      data={trueFalse}
                      labelField={"label"}
                      valueField={"value"}
                      style={[
                        styles.input,
                        loan?.final_approval !== null && { opacity: 0.7 },
                      ]}
                    />
                  </View>
                )}
                name="defaultStatus"
                defaultValue={loan?.customer_default ?? undefined}
              />
              {errors.defaultStatus && (
                <Text style={styles.error}>
                  {errors.defaultStatus?.message}
                </Text>
              )}
              <Controller
                control={control}
                rules={{
                  required: true,
                  validate: (v) => {
                    if (v === "" || v === undefined)
                      return "Interest Rate is required";
                    const num = Number(v);
                    if (isNaN(num)) return "Interest Rate must be a number";
                    if (num < 0 || num > 100)
                      return "Interest Rate must be between 0 and 100 percent (%)";
                    return true;
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ gap: 5 }}>
                    <Text style={styles.inputTitle}>Interest Rate (%)</Text>
                    <TextInput
                      onBlur={onBlur}
                      onChangeText={onChange}
                      editable={loan?.final_approval === null}
                      value={value ?? ""}
                      placeholderTextColor={Colors.light.themeColor}
                      style={[
                        styles.input,
                        loan?.final_approval !== null && { opacity: 0.7 },
                      ]}
                      inputMode="numeric"
                      keyboardType="numeric"
                    />
                  </View>
                )}
                name="interestRate"
                defaultValue={
                  typeof loan?.loan_interest_rate === "number"
                    ? String(loan.loan_interest_rate)
                    : ""
                }
              />
              {errors.interestRate && (
                <Text style={styles.error}>{errors.interestRate?.message}</Text>
              )}
            </ScrollView>
            {loan?.final_approval === null && (
              <View
                style={{
                  marginTop: 10,
                  backgroundColor: Colors.light.background,
                  borderRadius: 10,
                  paddingVertical: 5,
                }}
              >
                <Button title="Submit" onPress={handleSubmit(onSubmit)} />
              </View>
            )}
          </>
        )}
        {isAIPrediction && (
          <View
            style={{
              marginTop: 10,
              backgroundColor: Colors.light.background,
              borderRadius: 10,
              paddingVertical: 20,
              paddingHorizontal: 20,
            }}
          >
            <Text style={styles.modalHeaderText}>AI Prediction Result</Text>
            <View style={{ gap: 10 }}>
              <View>
                <Text style={styles.inputTitle}>Predicted Approval</Text>
                <Text style={[styles.input, { minHeight: 0 }]}>
                  {loanPrediction.prediction !== undefined
                    ? loanPrediction.prediction > 0.5
                      ? "Approve"
                      : "Reject"
                    : "N/A"}
                </Text>
              </View>
              <View>
                <Text style={styles.inputTitle}>Approval Percentage</Text>
                <Text style={[styles.input, { minHeight: 0 }]}>
                  {loanPrediction.prediction !== undefined
                    ? (loanPrediction.prediction * 100).toFixed(2) + "%"
                    : "N/A"}
                </Text>
              </View>
              <View>
                <Text style={styles.inputTitle}>Top 10 Deciding Features</Text>
                <ScrollView
                  style={[
                    styles.inputContainer,
                    { maxHeight: 250, paddingBottom: 10 },
                  ]}
                  showsVerticalScrollIndicator={true}
                >
                  <Text style={{}}>
                    {loanPrediction.shap_values ? (
                      Object.entries(loanPrediction.shap_values)
                        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                        .slice(0, 10)
                        .map(([feature, value], idx) => (
                          <Text key={feature} style={{ paddingBottom: 5 }}>
                            {idx + 1}.{" "}
                            {feature
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                            :{" "}
                            <Text
                              style={{ color: value > 0 ? "green" : "red" }}
                            >
                              {value > 0 ? "↑" : "↓"}{" "}
                              {Math.abs(value).toFixed(3)}
                              {"\n"}
                            </Text>
                          </Text>
                        ))
                    ) : (
                      <Text>No explanation available.</Text>
                    )}
                  </Text>
                </ScrollView>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 10,
    backgroundColor: Colors.light.themeColor,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  containerHeader: {
    backgroundColor: Colors.light.grayColor,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 15,
    borderBottomWidth: 15,
  },
  containerHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  customerDetailsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  customerHalfContainer: {
    gap: 10,
    justifyContent: "space-between",
    width: "70%",
  },
  customerDetailsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textAlign: "auto",
  },
  buttonContainer: {
    width: "80%",
    maxWidth: "80%",
    alignItems: "center",
    borderWidth: 5,
    borderColor: Colors.light.themeColor,
    borderRadius: 10,
    padding: 10,
    textAlign: "center",
    boxShadow: "0px 3px 5px 1px rgba(0,0,0,0.75)",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  predictionContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 5,
    marginHorizontal: 10,
    borderRadius: 15,
    boxShadow: "0px 3px 5px 2px rgba(0,0,0,0.75)",
  },
  predictionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textAlign: "auto",
  },
  modal: {
    justifyContent: "center",
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
  modalHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "black",
    marginBottom: 10,
  },
});

export default LoanDetails;
