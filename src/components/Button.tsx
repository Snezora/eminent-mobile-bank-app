import { TouchableOpacity, View, Text, StyleSheet, StyleProp } from "react-native";
import Colors from "../constants/Colors";

const colorMap = {
  default: Colors.light.themeColorSecondary,
  reject: Colors.light.themeColorReject,
};

const Button = ({
  label,
  onClick,
  type = "default",
  style
}: {
  label: string;
  onClick?: () => void;
  type?: keyof typeof colorMap;
  style? : StyleProp<any>;
}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.button, style, { backgroundColor: colorMap[type] }]}
    >
      <View>
        <Text style={styles.buttonText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonText: {
    color: "white",
  },
});

export default Button;
