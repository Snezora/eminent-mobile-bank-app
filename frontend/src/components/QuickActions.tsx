import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "../constants/Colors";
import { useAuth } from "@/src/providers/AuthProvider";
import { useEffect, useState } from "react";
import fetchListofAccounts from "../providers/fetchListofAccounts";
import { Account } from "@/assets/data/types";

const actions = [
  {
    id: 1,
    title: "Transfer",
    icon: "send-outline",
    route: "/(user)/(transfer)/newTransfer",
    color: "#4CAF50",
  },
  {
    id: 2,
    title: "QR Pay",
    icon: "qr-code-outline",
    route: "/(user)/camera",
    color: "#9C27B0",
  },
  {
    id: 3,
    title: "Apply Loan",
    icon: "card-outline",
    route: "/(user)/newLoan",
    color: "#2196F3",
  },
  {
    id: 4,
    title: "History",
    icon: "time-outline",
    route: "/(transfer)/transferHistory",
    color: "#607D8B",
  },
  {
    id: 5,
    title: "Top Up",
    icon: "add-circle-outline",
    route: null,
    color: "#00BCD4",
  },
  {
    id: 6,
    title: "Pay Bills",
    icon: "receipt-outline",
    route: null,
    color: "#FF9800",
  },
  {
    id: 7,
    title: "Cards",
    icon: "card-outline",
    route: null,
    color: "#795548",
  },
  {
    id: 8,
    title: "Support",
    icon: "help-circle-outline",
    route: null,
    color: "#F44336",
  },
];

const QuickActions = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();
  const { user, authenticateBiometric, isBiometricAuthenticated } = useAuth();
  const [firstAccount, setFirstAccount] = useState<Account | null>(null);

  const handleActionPress = async (action: (typeof actions)[0]) => {
    try {
      if (!isBiometricAuthenticated) {
        authenticateBiometric().then(() => {
          if (!isBiometricAuthenticated) {
            // If authentication was not successful, show an alert
            Alert.alert(
              "Authentication Required",
              "You must authenticate to access this feature.",
              [
                {
                  text: "OK",
                  style: "default",
                },
              ]
            );
            return;
          }
        });
      }

      // Authentication successful, proceed with the action
      if (action.route) {
        // Special handling for QR Pay (camera) route
        if (action.route === "/(user)/camera") {
          if (firstAccount) {
            router.push({
              pathname: "/(user)/camera",
              params: { account_no: firstAccount.account_no },
            });
          } else {
            Alert.alert(
              "No Account Found",
              "Please ensure you have an active account to use QR Pay.",
              [
                {
                  text: "OK",
                  style: "default",
                },
              ]
            );
          }
        } else {
          // For all other routes, use regular navigation
          router.push(action.route as any);
        }
      } else {
        // Show popup for features not implemented
        Alert.alert(
          "Feature Not Available",
          `${action.title} is not implemented yet. Coming soon!`,
          [
            {
              text: "OK",
              style: "default",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error during authentication or navigation:", error);
      Alert.alert("Error", "An error occurred. Please try again.", [
        {
          text: "OK",
          style: "default",
        },
      ]);
    }
  };

  // Fetch and select the first account if available
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;
      try {
        // Assuming fetchListofAccounts is a function that fetches accounts
        const accountsData = await fetchListofAccounts({
          isMockEnabled: false,
          isAdmin: false,
          customer_id: "customer_id" in user ? user.customer_id : undefined,
        });

        if (accountsData && accountsData.length > 0) {
          setFirstAccount(accountsData[0]);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    fetchAccounts();
  }, [user, isBiometricAuthenticated]);

  return (
    <View style={[styles.container]}>
      <FlatList
        data={actions}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleActionPress(item)}
            style={styles.actionButton}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDarkMode
                    ? Colors.dark.firstButton
                    : "white",
                  borderLeftWidth: 3,
                  borderLeftColor: item.color,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={item.color}
                />
              </View>
              <Text
                style={[
                  styles.actionText,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text },
                ]}
              >
                {item.title}
              </Text>
              {isBiometricAuthenticated && (
                <Ionicons
                  name="lock-open"
                  size={10}
                  color={isDarkMode ? Colors.dark.text : Colors.light.text}
                  style={styles.lockIcon}
                />
              )}
              {!isBiometricAuthenticated && (
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color={isDarkMode ? Colors.dark.text : Colors.light.text}
                  style={styles.lockIcon}
                />
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 15, paddingLeft: 20, paddingRight: 20 }}
        horizontal
        scrollEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'text'),
  },
  actionButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card: {
    backgroundColor: "white",
    padding: 12,
    width: 85,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    gap: 8,
    position: "relative",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14,
  },
  lockIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    opacity: 0.5,
  },
});

export default QuickActions;
