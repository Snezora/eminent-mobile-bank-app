import Colors from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { loans } from "@/assets/data/dummyLoans";
import AdminLoansBlock from "@/src/components/AdminLoansBlock";

const LoansPage = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
              Loans
            </Text>
          </View>
          <View style={styles.mainContainer}>
            <Animated.FlatList
              data={loans}
              renderItem={({ item, index }) => <AdminLoansBlock loan={item} />}
              ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                    }, 2000);
                  }}
                />
              }
            />
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
  },
});

export default LoansPage;
