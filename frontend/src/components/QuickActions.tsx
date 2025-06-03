import { View, Text, StyleSheet, FlatList, Pressable, useColorScheme, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors";
import { useThemeColor } from "./Themed";

const actions = [
  { id: 1, title: "Action 1" },
  { id: 2, title: "Action 2" },
  { id: 3, title: "Action 3" },
  { id: 4, title: "Action 4" },
  { id: 5, title: "Action 5" },
  { id: 6, title: "Action 6" },
  { id: 7, title: "Action 7" },
  { id: 8, title: "Action 8" },
];

const QuickActions = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";


  return (
    <View style={[styles.container]}>
      <FlatList
        data={actions}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => console.log("Pressed", item.title)}>
            <View style={[styles.card, { backgroundColor: isDarkMode ? Colors.dark.firstButton : "white" }]}>
              <Text style={{ color: isDarkMode ? Colors.dark.text : Colors.light.text }}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 20, paddingLeft: 20, paddingRight: 20 }}
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
  card: {
    backgroundColor: "white",
    padding: 10,
    width: 80,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default QuickActions;
