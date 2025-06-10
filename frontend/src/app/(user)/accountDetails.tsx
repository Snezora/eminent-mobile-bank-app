import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Switch,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import Colors from "@/src/constants/Colors";
import { Account } from "@/assets/data/types";
import { Button } from "react-native";

const AccountDetails = () => {
  const router = useRouter();
  const { account_id } = useLocalSearchParams();
  const { user } = useAuth();
  const isDarkMode = useColorScheme() === "dark";

  const [account, setAccount] = useState<Account | null>(null);
  const [nickname, setNickname] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAccountDetails();
  }, [account_id]);

  const fetchAccountDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("Account")
        .select("*")
        .eq("account_id", account_id)
        .eq("customer_id", user?.customer_id)
        .single();

      if (error) {
        console.error("Error fetching account details:", error);
        Alert.alert("Error", "Failed to load account details");
        return;
      }

      if (data) {
        setAccount(data);
        setNickname(data.nickname || "");
        setIsActive(data.account_status === "Active");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!account) return;

    setSaving(true);
    try {
      const updateData: any = {
        nickname: nickname.trim() || null,
      };

      if (
        account.account_status !== "Pending" &&
        account.account_status !== "Blocked"
      ) {
        updateData.account_status = isActive ? "Active" : "Inactive";
      }

      const { error } = await supabase
        .from("Account")
        .update(updateData)
        .eq("account_id", account.account_id);

      if (error) {
        console.error("Error updating account:", error);
        Alert.alert("Error", "Failed to update account details");
        return;
      }

      const statusUpdated =
        account.account_status !== "Pending" &&
        account.account_status !== "Blocked";
      const message = statusUpdated
        ? "Account details updated successfully!"
        : "Account nickname updated successfully!";

      Alert.alert("Success", message, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      "Confirm Deactivation",
      "Are you sure you want to deactivate this account? You won't be able to use it for transactions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => setIsActive(false),
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}
      >
        <View style={styles.centerContainer}>
          <Text
            style={[
              styles.loadingText,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Loading account details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!account) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}
      >
        <View style={styles.centerContainer}>
          <Text
            style={[
              styles.errorText,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Account not found
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? Colors.dark.background
            : Colors.light.background,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Account Details
          </Text>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: isDarkMode
                ? Colors.dark.firstButton
                : Colors.light.background,
              //   borderColor: isDarkMode ? Colors.dark.border : Colors.light.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Account Information
          </Text>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
              ]}
            >
              Account Number:
            </Text>
            <Text
              style={[
                styles.value,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
              ]}
            >
              {account.account_no}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
              ]}
            >
              Account Type:
            </Text>
            <Text
              style={[
                styles.value,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
              ]}
            >
              {account.account_type}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
              ]}
            >
              Balance:
            </Text>
            <Text
              style={[
                styles.value,
                styles.balanceText,
                {
                  color: isDarkMode
                    ? Colors.dark.themeColorSecondary
                    : Colors.light.themeColor,
                },
              ]}
            >
              USD {account.balance.toFixed(2)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
              ]}
            >
              Status:
            </Text>
            <Text
              style={[
                styles.value,
                {
                  color:
                    account.account_status === "Active"
                      ? isDarkMode
                        ? "lightgreen"
                        : "green"
                      : "red",
                  fontWeight: "bold",
                },
              ]}
            >
              {account.account_status}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: isDarkMode
                ? Colors.dark.firstButton
                : Colors.light.background,
              //   borderColor: isDarkMode ? Colors.dark.border : Colors.light.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Account Settings
          </Text>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputLabel,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text },
              ]}
            >
              Account Nickname (Optional, up to 20 characters):
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDarkMode
                    ? Colors.dark.background
                    : Colors.light.background,
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                  //   borderColor: isDarkMode
                  //     ? Colors.dark.border
                  //     : Colors.light.border,
                },
              ]}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter a nickname for this account"
              placeholderTextColor={isDarkMode ? "#A9A9A9" : "#B0B0B0"}
              maxLength={20}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text
                style={[
                  styles.switchLabel,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                ]}
              >
                Account Active
              </Text>
              <Text
                style={[
                  styles.switchDescription,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                ]}
              >
                {isActive
                  ? "This account can be used for transactions"
                  : "This account is inactive and cannot be used for transactions"}
              </Text>
            </View>
            <Switch
              value={isActive}
              disabled={account?.account_status === "Blocked"}
              onValueChange={(value) => {
                if (account?.account_status === "Blocked") {
                  Alert.alert(
                    "Account Blocked",
                    "This account is blocked and cannot be activated. Please contact customer support."
                  );
                  return;
                } else if (account?.account_status === "Pending") {
                  Alert.alert(
                    "Account Pending",
                    "This account is pending activation. Please wait for approval."
                  );
                  return;
                }

                if (!value) {
                  handleDeactivateAccount();
                } else {
                  setIsActive(true);
                }
              }}
              trackColor={{
                false: "#767577",
                true:
                  account?.account_status === "Blocked"
                    ? "#cccccc"
                    : Colors.light.themeColor,
              }}
              thumbColor={
                account?.account_status === "Blocked"
                  ? "#f4f3f4"
                  : isActive
                  ? "#f5dd4b"
                  : "#f4f3f4"
              }
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={saving ? "Saving..." : "Save Changes"}
            onPress={handleSaveChanges}
            disabled={saving}
          />
          <Button title="Cancel" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  balanceText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchInfo: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 15,
    marginTop: 20,
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default AccountDetails;
