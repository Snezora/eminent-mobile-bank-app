import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { navigate } from "expo-router/build/global-state/routing";
import { TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

const SettingsLogOut = () => {
  const router = useRouter();
  const { session, isAdmin } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error signing out:", error.message);
    } else {
      router.dismissAll();
      router.push("/(auth)/sign-in");
    }
  };


  return (
    <View style={{ flexDirection: "row", gap: 15, alignContent: "center" }}>
      <TouchableOpacity
        onPress={() => console.log("IsAdmin: ", isAdmin)}
        activeOpacity={1}
      >
        <Ionicons name="cog" size={30} color="white" style={{}} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleLogout}
        activeOpacity={1}
      >
        <Ionicons name="log-out-outline" size={30} color="white" style={{}} />
      </TouchableOpacity>
    </View>
  );
};

export default SettingsLogOut;
