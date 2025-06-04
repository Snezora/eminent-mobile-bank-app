import Colors from "@/src/constants/Colors";
import { View, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NewTransferPage = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#385A93" }]}
      edges={["top"]}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode
            ? Colors.dark.background
            : Colors.light.background,
        }}
      >
        <Text>NewTransferPage</Text>
      </View>
    </SafeAreaView>
  );
};

export default NewTransferPage;
