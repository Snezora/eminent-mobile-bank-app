import Colors from "@/src/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  useColorScheme,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ImageBackground,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import bankLogos from "@/src/constants/Banks";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "react-native-ui-lib";
import { supabase } from "@/src/lib/supabase";
import { ScrollView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import BottomImageLight from "@/assets/images/backgroundBlobs/layered-waves-haikei_light.svg";
import BottomImageDark from "@/assets/images/backgroundBlobs/layered-waves-haikei_dark.svg";
import { Account } from "@/assets/data/types";
import { useAuth } from "@/src/providers/AuthProvider";

const NewTransferPage = () => {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const { bankName, account_no, transfer_account } = useLocalSearchParams();
  const isDarkMode = colorScheme === "dark";
  const [selectedBank, setSelectedBank] = useState<
    | {
        name: string;
        full_bank_name: string;
        logo: any;
        maxValue: number;
      }
    | null
    | undefined
  >(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const editableForm = yup.object({
    account_no: yup
      .string()
      .required(
        selectedBank ? "Account number is required" : "Select a bank first"
      )
      .matches(/^[0-9]+$/, "Account number must be numeric")
      .min(
        selectedBank?.maxValue,
        selectedBank
          ? `${selectedBank?.full_bank_name} account number must be ${selectedBank?.maxValue} digits`
          : "Select a bank first"
      )
      .max(
        selectedBank?.maxValue,
        selectedBank
          ? `${selectedBank?.full_bank_name} account number must be ${selectedBank?.maxValue} digits`
          : "Select a bank first"
      ),
    selected_bank: yup
      .string()
      .required("Bank is required")
      .oneOf(["EWB"], "Not yet implemented. (Showing this in Dev Mode)"),
    amount: yup
      .number()
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value
      )
      .required("Amount is required")
      .min(0, "Amount must be a positive number")
      .max(
        selectedAccount?.balance,
        `Amount must be less than balance (${selectedAccount?.balance})`
      ),
    purpose: yup.string(),
    selected_account: yup.string().required("Transfer Account is required"),
  });

  const onSubmit = async (data) => {
    try {
      Alert.alert("Success", "Account created successfully!", [{ text: "OK" }]);
      router.push("/(user)/(tabs)/accounts");
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
  } = useForm({
    resolver: yupResolver(editableForm),
    defaultValues: {
      selected_bank: bankName || "",
      account_no: account_no || "",
      amount: "",
      purpose: "",
      selected_account: transfer_account || "",
    },
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase
        .from("Account")
        .select("*")
        .eq("customer_id", user?.customer_id);

      if (data) {
        const filteredAccounts = data
          .filter((account) => account.account_no !== account_no)
          .map((account) => ({
            ...account,
            nickname: account.nickname || account.account_no,
          }));
        setAccounts(filteredAccounts);
      } else if (error) {
        console.error("Error fetching accounts:", error.message);
      }
    };

    fetchAccounts();
  }, [user?.customer_id, account_no]); // Add account_no as a dependency

  useEffect(() => {
    clearErrors("account_no");
  }, [selectedBank]);

  useEffect(() => {
    if (!bankName) return;
    setSelectedBank(bankLogos.find((bank) => bank.name === bankName));    
    setSelectedAccount(accounts.find((account) => account.account_no === transfer_account) || null);
    if (transfer_account == account_no) {
      Alert.alert(
        "Error",
        "You cannot transfer to the same account.",
        [{ text: "OK" }]
      );
      router.back();
      router.reload();
    }
  }, [bankName, accounts, transfer_account]);

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#385A93" }]}
      edges={["top"]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 10,
        }}
      >
        <Ionicons name="chevron-back-outline" size={24} color="white" />
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
          Back
        </Text>
      </View>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: isDarkMode
            ? Colors.dark.background
            : Colors.light.background,
          padding: 20,
          zIndex: 999,
        }}
        contentContainerStyle={{
          marginTop: 50,
          gap: 20,
        }}
        scrollEnabled={false}
      >
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={{ gap: 5 }}>
              <View style={{ flexDirection: "row" }}>
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
                  Selected Bank
                </Text>
                <Text style={{ color: "red" }}>*</Text>
              </View>
              <Dropdown
                search
                data={bankLogos}
                onBlur={onBlur}
                onChange={(item) => {
                  onChange(item.name);
                  setSelectedBank(item);
                }}
                value={value}
                labelField={"full_bank_name"}
                valueField={"name"}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  borderColor: Colors.light.themeColor,
                  borderWidth: 2,
                  height: 64,
                }}
                placeholder="Select a bank"
                placeholderStyle={{
                  color: isDarkMode ? "#A9A9A9" : "#B0B0B0",
                }}
                searchPlaceholder="Search a bank"
                itemContainerStyle={{
                  backgroundColor: Colors.light.background,
                }}
                selectedTextStyle={{
                  fontWeight: "bold",
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
                renderItem={(item) => {
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        padding: 10,
                        borderRadius: 20,
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          width: 50,
                          height: 50,
                          borderRadius: 50,
                        }}
                      >
                        <Image
                          source={item.logo}
                          style={{ width: 40, height: 40 }}
                          resizeMode="contain"
                        />
                      </View>
                      <View
                        style={{
                          marginLeft: 10,
                          justifyContent: "center",
                          paddingVertical: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "black",
                            fontWeight: "bold",
                          }}
                        >
                          {item.full_bank_name}
                        </Text>
                      </View>
                    </View>
                  );
                }}
                renderLeftIcon={() => {
                  if (selectedBank) {
                    return (
                      <Image
                        source={selectedBank.logo} // Render the logo of the selected bank
                        style={{ width: 40, height: 40, marginRight: 10 }}
                        resizeMode="contain"
                      />
                    );
                  }
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 40,
                        width: 40,
                        marginRight: 10,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="bank"
                        size={30}
                        color={
                          isDarkMode ? Colors.dark.text : Colors.light.text
                        }
                      />
                    </View>
                  );
                }}
              ></Dropdown>
            </View>
          )}
          name="selected_bank"
        />
        {errors.selected_bank && (
          <View style={{ height: errors.selected_bank ? undefined : 0 }}>
            <Text style={styles.error}>{errors.selected_bank?.message}</Text>
          </View>
        )}
        <Controller
          name="account_no"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={{ gap: 5 }}>
              <View style={{ flexDirection: "row" }}>
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
                <Text style={{ color: "red" }}>*</Text>
              </View>
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                keyboardType="numeric"
                value={value}
                style={[
                  styles.inputContainer,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                ]}
                placeholder="Enter account number"
                placeholderTextColor={isDarkMode ? "#A9A9A9" : "#B0B0B0"}
              />
            </View>
          )}
        />
        {errors.account_no && (
          <View style={{ height: errors.account_no ? undefined : 0 }}>
            <Text style={styles.error}>{errors.account_no?.message}</Text>
          </View>
        )}
        <Controller
          name="selected_account"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={{ gap: 5 }}>
              <View style={{ flexDirection: "row" }}>
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
                  From Account
                </Text>
                <Text style={{ color: "red" }}>*</Text>
              </View>
              <Dropdown
                data={accounts}
                onBlur={onBlur}
                onChange={(item) => {
                  onChange(item.account_id);
                  setSelectedAccount(item);
                }}
                value={value}
                labelField={"nickname"}
                valueField={"account_no"}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  borderColor: Colors.light.themeColor,
                  borderWidth: 2,
                  height: 64,
                }}
                placeholder="Select an account"
                placeholderStyle={{
                  color: isDarkMode ? "#A9A9A9" : "#B0B0B0",
                }}
                itemContainerStyle={{
                  backgroundColor: Colors.light.background,
                }}
                selectedTextStyle={{
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              ></Dropdown>
            </View>
          )}
        />
        {errors.selected_account && (
          <View style={{ height: errors.selected_account ? undefined : 0 }}>
            <Text style={styles.error}>
              {errors.selected_account?.message}
            </Text>
          </View>
        )}
        <Controller
          name="amount"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={{ gap: 5 }}>
              <View style={{ flexDirection: "row" }}>
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
                  Transfer Amount
                </Text>
                <Text style={{ color: "red" }}>*</Text>
              </View>
              <View
                style={[
                  styles.inputContainer,
                  { flexDirection: "row", alignItems: "center" },
                ]}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: isDarkMode ? Colors.dark.text : Colors.light.text,
                  }}
                >
                  USD
                </Text>
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  value={value ? String(value) : ""}
                  style={[{ fontSize: 16, textAlign: "right", flex: 1 }]} // Align text to the right
                  placeholder="Enter amount"
                  placeholderTextColor={isDarkMode ? "#A9A9A9" : "#B0B0B0"}
                  inputMode="decimal"
                />
              </View>
            </View>
          )}
        />
        {errors.amount && (
          <View style={{ height: errors.amount ? undefined : 0 }}>
            <Text style={styles.error}>{errors.amount?.message}</Text>
          </View>
        )}
        <Controller
          name="purpose"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={{ gap: 5 }}>
              <View style={{ flexDirection: "row" }}>
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
                  Transfer Purpose
                </Text>
              </View>
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.inputContainer}
                placeholder="Enter transfer purpose"
                placeholderTextColor={isDarkMode ? "#A9A9A9" : "#B0B0B0"}
              />
            </View>
          )}
        />
        {errors.purpose && (
          <View style={{ height: errors.purpose ? undefined : 0 }}>
            <Text style={styles.error}>{errors.purpose?.message}</Text>
          </View>
        )}
        <TouchableOpacity
          style={{
            marginTop: 30,
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
              "Confirm Tras",
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
            Transfer
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.themeColor,
    marginBottom: 5,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginTop: -10,
  },
  inputContainer: {
    borderWidth: 2,
    borderColor: Colors.light.themeColor,
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    minHeight: 50,
  },
});

export default NewTransferPage;
