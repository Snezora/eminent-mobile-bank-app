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
import * as LocalAuthentication from "expo-local-authentication";

export const AccountBasicInfoWithEye = ({
  account,
}: {
  account: AccountBasicInfoProps;
}) => {
  const colorScheme = useColorScheme();
  const [isEyeOpen, setIsEyeOpen] = useState(true);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);

  const handleEyePress = async () => {
    if (!hasAuthenticated) {
      const hasAuthenticated = await LocalAuthentication.authenticateAsync();
      if (hasAuthenticated.success) {
        setHasAuthenticated(true);
        setIsEyeOpen(!isEyeOpen);
      } else {
        console.log("Authentication failed");
        return;
      }
    } else {
      setIsEyeOpen(!isEyeOpen);
    }
  };

  return (
    <View>
      <Text style={[styles.accNo]}>
        {isEyeOpen ? "**** **** ****" : account.accountNo}
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
