import { Account, Customer } from "@/assets/data/types";
import Button from "@/src/components/Button";
import Colors from "@/src/constants/Colors";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { set } from "react-hook-form";
import {
  View,
  Text,
  useColorScheme,
  Alert,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Checkbox } from "react-native-ui-lib";
import * as LocalAuthentication from "expo-local-authentication";

const TransferConfirmationPage = () => {
  const { user } = useAuth();
  const { account_no, selected_bank, amount, purpose, transfer_account_id } =
    useLocalSearchParams();
  const [receiverAccount, setReceiverAccount] = useState<Account | null>(null);
  const [receiverCustomer, setReceiverCustomer] = useState<Customer | null>(
    null
  );
  const [senderAccount, setSenderAccount] = useState<Account | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [fetchedFromFavorite, setFetchedFromFavorite] = useState(false);
  const [favoriteNickname, setFavoriteNickname] = useState("");

  const handleTransfer = () => {
    if (receiverAccount == null) return;

    // Do update balance for sender first
    const updateSenderBalance = async () => {
      const { data, error } = await supabase
        .from("Account")
        .update({ balance: senderAccount?.balance - Number(amount) })
        .eq("account_id", senderAccount?.account_id);

      if (error) {
        console.error("Error updating sender balance:", error);
        throw error;
      }
    };

    const updateReceiverBalance = async () => {
      const { data, error } = await supabase
        .from("Account")
        .update({ balance: receiverAccount?.balance + Number(amount) })
        .eq("account_no", receiverAccount?.account_no);

      if (error) {
        console.error("Error updating receiver balance:", error);
        throw error;
      }
    };

    // Create transaction log
    const createTransactionLog = async () => {
      const { data, error } = await supabase.from("Transaction").insert({
        initiator_account_id: senderAccount?.account_id,
        receiver_account_no: receiverAccount?.account_no,
        amount: Number(amount),
        type_of_transfer: "Internal Transfer",
        transfer_datetime: new Date().toISOString(),
        purpose: purpose || null,
      });

      if (error) {
        console.error("Error creating transaction log:", error);
        throw error;
      }
    };

    // Add to favorites if selected and not already in favorites
    const updateFavorites = async () => {
      if (!favorite || fetchedFromFavorite || !senderAccount) return;

      try {
        // Get current favorite accounts
        const currentFavorites = senderAccount.favourite_accounts || [];

        // Create new favorite entry
        const newFavorite = {
          bankName: selected_bank as string,
          nickname:
            favoriteNickname.trim() || // Use favoriteNickname if provided
            (receiverCustomer?.first_name && receiverCustomer?.last_name
              ? `${receiverCustomer.first_name} ${receiverCustomer.last_name}`
              : `Account ${String(account_no).slice(-4)}`), // Fallback nickname
          account_no: account_no as string,
        };

        const alreadyExists = currentFavorites.some(
          (fav: any) => fav.account_no === account_no
        );

        if (!alreadyExists) {
          // Add new favorite to the array
          const updatedFavorites = [...currentFavorites, newFavorite];

          // Update the sender account with new favorites
          const { error } = await supabase
            .from("Account")
            .update({ favourite_accounts: updatedFavorites })
            .eq("account_id", senderAccount.account_id);

          if (error) {
            console.error("Error updating favorites:", error);
            throw error;
          }

          console.log("Successfully added to favorites:", newFavorite);
        }
      } catch (error) {
        console.error("Error in updateFavorites:", error);
      }
    };

    // Execute all operations in sequence
    const executeTransfer = async () => {
      try {
        await updateSenderBalance();
        await updateReceiverBalance();
        await createTransactionLog();
        await updateFavorites();

        setIsModalVisible(true);
      } catch (error) {
        console.error("Transfer failed:", error);
        Alert.alert(
          "Transfer Failed",
          "An error occurred during the transfer. Please try again.",
          [{ text: "OK" }]
        );
      }
    };

    executeTransfer();
  };

  useEffect(() => {
    const fetchSenderAccount = async () => {
      const { data: sender_account, error } = await supabase
        .from("Account")
        .select("*")
        .eq("account_id", transfer_account_id)
        .single();

      if (error) {
        console.error("Error fetching sender account:", error);
      } else {
        setSenderAccount(sender_account);
        return sender_account;
      }
    };

    const fetchReceiverAccount = async () => {
      const { data: receiver_account, error } = await supabase
        .from("Account")
        .select("*")
        .eq("account_no", account_no)
        .single();

      if (error) {
        console.error("Error fetching receiver account:", error);
      } else {
        setReceiverAccount(receiver_account);
        return receiver_account;
      }
    };

    const fetchReceiver = async (receiverAcc: Account | null) => {
      if (selected_bank !== "EWB") {
        return;
      }

      const { data: receiver, error } = await supabase
        .from("Customer")
        .select("*")
        .eq("customer_id", receiverAcc?.customer_id)
        .single();

      if (error) {
        console.error("Error fetching receiver:", error);
      } else {
        setReceiverCustomer(receiver);
      }
    };

    const checkIfFavorite = async (senderAcc: any) => {
      if (!senderAcc?.favourite_accounts) return;

      const favoriteAccounts = senderAcc.favourite_accounts;
      const isFavorite = favoriteAccounts.some(
        (favAccount: any) => favAccount.account_no === account_no
      );

      setFetchedFromFavorite(isFavorite);
      setFavorite(isFavorite);
    };

    // Chain the async calls properly
    fetchSenderAccount().then((senderAcc) => {
      if (senderAcc) {
        checkIfFavorite(senderAcc);
      }
    });

    fetchReceiverAccount().then((receiverAcc) => {
      if (receiverAcc) {
        fetchReceiver(receiverAcc);
      }
    });
  }, [
    account_no,
    receiverAccount?.customer_id,
    transfer_account_id,
    selected_bank,
  ]);

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#385A93" }]}
      edges={["top"]}
    >
      <View
        style={{
          flexDirection: "row",
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
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            height: "100%",
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
            padding: 20,
            paddingTop: 50,
          }}
        >
          <Text
            style={{
              color: isDarkMode ? Colors.dark.text : Colors.light.text,
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
            }}
          >
            Transferring To:
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              borderColor: "black",
              borderWidth: 1,
              borderRadius: 20,
              padding: 10,
              paddingHorizontal: 20,
              backgroundColor: isDarkMode ? Colors.dark.firstButton : "white",
            }}
          >
            <View
              style={{
                marginRight: 10,
                backgroundColor: isDarkMode
                  ? Colors.light.background
                  : Colors.dark.background,
                borderRadius: 50,
                height: 46,
                width: 46,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome
                name="user"
                size={24}
                color={isDarkMode ? "black" : "white"}
              />
            </View>
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                {receiverCustomer?.first_name} {receiverCustomer?.last_name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                {receiverAccount?.account_no}
              </Text>
            </View>
          </View>
          <Text
            style={{
              color: isDarkMode ? Colors.dark.text : Colors.light.text,
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              marginTop: 20,
            }}
          >
            Transferring From:
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              borderColor: "black",
              borderWidth: 1,
              borderRadius: 20,
              padding: 10,
              paddingHorizontal: 20,
              backgroundColor: isDarkMode ? Colors.dark.firstButton : "white",
            }}
          >
            <View
              style={{
                marginRight: 10,
                backgroundColor: isDarkMode
                  ? Colors.light.background
                  : Colors.dark.background,
                borderRadius: 50,
                height: 46,
                width: 46,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome
                name="user"
                size={24}
                color={isDarkMode ? "black" : "white"}
              />
            </View>
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                {user?.first_name} {user?.last_name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                {senderAccount?.nickname
                  ? `${senderAccount?.nickname} (${senderAccount?.account_no})`
                  : senderAccount?.account_no}
              </Text>
            </View>
          </View>
          <View
            style={{
              marginTop: 50,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              <FontAwesome6
                name="money-bill-wave"
                size={24}
                color={isDarkMode ? Colors.dark.text : Colors.light.text}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                Transfer Amount:
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                USD
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                {Number(amount).toFixed(2)}
              </Text>
            </View>
          </View>
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              <FontAwesome6
                name="pen-clip"
                size={24}
                color={isDarkMode ? Colors.dark.text : Colors.light.text}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                Remark
              </Text>
            </View>
            <ScrollView
              style={{
                maxWidth: "50%",
                maxHeight: 150, // Set the height to 50px
              }}
              contentContainerStyle={{
                flexGrow: 1, // Ensure the content fills the ScrollView
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                  lineHeight: 20, // Adjust line height for better readability
                  textAlign: "right",
                }}
              >
                {purpose}
              </Text>
            </ScrollView>
          </View>
          <Checkbox
            style={{}}
            disabled={fetchedFromFavorite}
            containerStyle={{ marginTop: 30 }}
            iconColor="white"
            color={Colors.light.themeColor}
            label={
              fetchedFromFavorite ? "Already in Favorites" : "Add to Favorites"
            }
            value={favorite}
            onValueChange={setFavorite}
          />
          {!fetchedFromFavorite && favorite && (
            <TextInput
              style={{
                borderColor: "black",
                borderWidth: 1,
                borderRadius: 5,
                padding: 10,
                marginTop: 20,
                backgroundColor: isDarkMode ? Colors.dark.background : "white",
              }}
              value={favoriteNickname}
              onChangeText={setFavoriteNickname}
              placeholder="Enter a nickname (Max 20 characters)"
              maxLength={20}
            />
          )}
          <View>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                justifyContent: "space-evenly",
                marginTop: 30,
              }}
            >
              <Button
                label="Edit"
                onClick={() => {
                  router.back();
                }}
                type="reject"
              />
              <Button
                label="Confirm"
                onClick={() => {
                  Alert.alert("Confirmation", "Are you sure?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Confirm",
                      onPress: async () => {
                        // authenticate using LocalAuthentication
                        const isAuthenticated =
                          await LocalAuthentication.authenticateAsync({
                            promptMessage: "Authenticate to confirm transfer",
                            fallbackLabel: "Enter PIN",
                            cancelLabel: "Cancel",
                          });
                        if (isAuthenticated) {
                          handleTransfer();
                        } else {
                          Alert.alert(
                            "Authentication Failed",
                            "Please try again."
                          );
                        }
                      },
                    },
                  ]);
                }}
                type="default"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={require("@/assets/images/hover-check.gif")}
              style={{ width: 100, height: 100 }}
            />
            <Text style={styles.modalText}>Transfer Successful!</Text>
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(false);
                router.push("/(user)/(tabs)/accounts");
              }}
              style={{
                backgroundColor: Colors.light.themeColor,
                padding: 10,
                borderRadius: 5,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default TransferConfirmationPage;
