import { Account } from "@/assets/data/types";
import {
  View,
  Text,
  Image,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Colors from "../constants/Colors";
import bankLogos from "@/src/constants/Banks";
import { router } from "expo-router";

type ExternalAccountProps = {
  bankName: string;
  full_bank_name: string;
  account_no: string;
  nickname: string;
};

type BankTabProps = {
  isEWBBank: boolean;
  external_account?: ExternalAccountProps;
  account?: Account;
  account_no?: string;
  nickname?: string;
};

const BankTab = ({
  account,
  isEWBBank,
  external_account,
  account_no,
  nickname,
}: BankTabProps) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  if (account && isEWBBank) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          borderColor: isDarkMode ? Colors.dark.text : Colors.light.text,
          padding: 10,
          borderRadius: 20,
          backgroundColor: isDarkMode ? Colors.dark.firstButton : "white",
        }}
        onPress={() => {
          if (account.account_status !== "Active") {
            Alert.alert(
              "Account Inactive",
              "Your account is currently inactive. Please contact support for assistance."
            );
            return;
          } else {
            router.push({
              pathname: "/(user)/(transfer)/newTransfer",
              params: {
                bankName: "EWB",
                account_no: account.account_no,
              },
            });
          }
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 60,
            backgroundColor: "white",
            height: 60,
            borderRadius: 50,
            elevation: 5,
            shadowColor: "black",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <Image
            source={require("@/assets/images/EWBLogo.png")}
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          />
        </View>
        <View
          style={{
            marginLeft: 10,
            justifyContent: "space-between",
            paddingVertical: 5,
          }}
        >
          <Text
            style={[
              styles.text,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            {account.nickname}
          </Text>
          <Text
            style={[
              styles.text,
              {
                color: isDarkMode ? Colors.dark.text : Colors.light.text,
                fontWeight: "normal",
              },
            ]}
          >
            {account.account_no}
          </Text>
        </View>
      </TouchableOpacity>
    );
  } else if (external_account && !isEWBBank) {
    const getBankLogo = (bankName: string) => {
      const bank = bankLogos.find((logo) => logo.name === bankName);
      return bank ? bank.logo : null;
    };

    const mapFullBankName = (externalAccounts: ExternalAccountProps[]) => {
      return externalAccounts.map((account) => {
        const bank = bankLogos.find((logo) => logo.name === account.bankName);
        return {
          full_bank_name: bank ? bank.full_bank_name : "Unknown Bank",
        };
      });
    };

    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          borderColor: isDarkMode ? Colors.dark.text : Colors.light.text,
          //   borderWidth: 1,
          padding: 10,
          borderRadius: 20,
          backgroundColor: isDarkMode ? Colors.dark.firstButton : "white",
        }}
        onPress={() => {
          if (external_account.bankName === "EWB") {
            router.push({
              pathname: "/(user)/(transfer)/newTransfer",
              params: {
                bankName: "EWB",
                account_no: external_account?.account_no,
              },
            });
          } else {
            Alert.alert("Bank not supported yet");
          }
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 60,
            backgroundColor: "white",
            height: 60,
            borderRadius: 50,
            elevation: 5,
            shadowColor: "black",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <Image
            source={getBankLogo(external_account.bankName)}
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          />
        </View>
        <View
          style={{
            marginLeft: 10,
            justifyContent: "space-between",
            paddingVertical: 5,
          }}
        >
          <Text
            style={[
              styles.text,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            {mapFullBankName([external_account])[0].full_bank_name}
          </Text>
          <Text
            style={[
              styles.text,
              { color: isDarkMode ? Colors.dark.text : Colors.light.text },
            ]}
          >
            {external_account?.nickname}
          </Text>
          <Text
            style={[
              styles.text,
              {
                color: isDarkMode ? Colors.dark.text : Colors.light.text,
                fontWeight: "normal",
              },
            ]}
          >
            {external_account.account_no}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BankTab;
