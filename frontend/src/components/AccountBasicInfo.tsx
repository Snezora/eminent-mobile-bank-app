import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
} from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { AccountBasicInfoProps } from "../types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Account } from "@/assets/data/types";
import { useAuth } from "../providers/AuthProvider";

export const AccountBasicInfoWithEye = ({
  account,
}: {
  account: Account;
}) => {
  const colorScheme = useColorScheme();
  const { session, user, isBiometricAuthenticated, authenticateBiometric } = useAuth();
  const [isEyeOpen, setIsEyeOpen] = useState(true);

  const handleEyePress = async () => {
    if (!isBiometricAuthenticated) {
      authenticateBiometric().then((success) => {
        if (success) {
          setIsEyeOpen(!isEyeOpen);
        } else {
          return;
        }
      });
    } else {
      setIsEyeOpen(!isEyeOpen);
    }
  };

  return (
    <View>
      <Text style={[styles.accNo]}>
        {isEyeOpen ? "**** **** ****" : account.account_no}
      </Text>
      <View
        style={{
          flexDirection: "row",
          maxWidth: 200,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={[styles.title]}>
          RM {isEyeOpen ? "****" : account.balance.toFixed(2)}
        </Text>
        <Ionicons
          name={isEyeOpen ? "eye-off" : "eye"}
          size={30}
          color={"white"}
          onPress={handleEyePress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  accNo: {
    fontSize: 16,
    color: "white",
    marginTop: 20,
    marginBottom: 15,
    fontWeight: "bold",
  },
});
