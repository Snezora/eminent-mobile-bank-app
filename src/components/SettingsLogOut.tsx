import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { navigate } from "expo-router/build/global-state/routing";
import { TouchableOpacity, View } from "react-native";

const SettingsLogOut = () => {
  const router = useRouter();

  return (
    <View style={{ flexDirection: "row", gap: 15, alignContent: "center" }}>
      <TouchableOpacity
        onPress={() => console.log("Pressed")}
        activeOpacity={1}
      >
        <Ionicons name="cog" size={30} color="white" style={{}} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.dismissAll()}
        activeOpacity={1}
      >
        <Ionicons name="log-out-outline" size={30} color="white" style={{}} />
      </TouchableOpacity>
    </View>
  );
};

export default SettingsLogOut;
