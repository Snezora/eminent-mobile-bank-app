import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  StyleProp,
} from "react-native";
import Colors from "../constants/Colors";

const colorMap = {
  default: Colors.light.themeColorSecondary,
  reject: Colors.light.themeColorReject,
  transparent: 'transparent',
};

const Button = ({
  label,
  onClick,
  type = "default",
  style,
  textStyle,
  disabled = false,
}: {
  label: string;
  onClick?: () => void;
  type?: keyof typeof colorMap;
  style?: StyleProp<any>;
  textStyle?: StyleProp<any>;
  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.button, style, { backgroundColor: colorMap[type] }]}
      disabled={disabled}
    >
      <View>
        <Text style={[styles.buttonText, textStyle]}>{label}</Text>
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
