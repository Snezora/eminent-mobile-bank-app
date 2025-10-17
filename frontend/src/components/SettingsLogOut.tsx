import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { navigate } from "expo-router/build/global-state/routing";
import { TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../providers/AuthProvider";

const SettingsLogOut = () => {
  const router = useRouter();
  const { session, isAdmin, logOut } = useAuth();

  const handleLogout = async () => {
    console.log("Session:", session);

    try {
      await logOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.dismissAll();      
      router.replace("/(auth)/home-page");
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 15, alignContent: "center" }}>
      {/* <TouchableOpacity
        onPress={() => console.log("IsAdmin: ", isAdmin)}
        activeOpacity={1}
      >
        <Ionicons name="cog" size={30} color="white" style={{}} />
      </TouchableOpacity> */}
      <TouchableOpacity onPress={handleLogout} activeOpacity={1}>
        <Ionicons name="log-out-outline" size={30} color="white" style={{}} />
      </TouchableOpacity>
    </View>
  );
};

export default SettingsLogOut;
