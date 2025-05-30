import { View, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Colors from "@/src/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Admin } from "@/assets/data/types";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

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

const ProfilePage = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Colors.light.themeColor }}
        edges={["top"]}
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
              gap: 10,
            }}
          >
            <TouchableOpacity activeOpacity={0} onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
              Admin Profile
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ProfilePage;
