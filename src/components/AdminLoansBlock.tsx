import { loans } from "@/assets/data/dummyLoans";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Loan } from "@/assets/data/types";
import Colors from "../constants/Colors";

const ColorMap = {
  "true": "green",
  "false": Colors.light.themeColorReject,
  "null": Colors.light.themeColor,
};

const AdminLoansBlock = ({ loan }: { loan: Loan }) => {
  const finalResult = loan.final_approval;
  const colorKey = finalResult === null ? "null" : finalResult ? "true" : "false";




  return (
    <TouchableOpacity activeOpacity={0.75}>
      <View style={[styles.blockContainer, {borderColor: ColorMap[colorKey]}]}>
        <View>

        </View>
        <Text>{loan.loan_id}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  blockContainer: {
    borderWidth: 3,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "white"
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  
});

export default AdminLoansBlock;
