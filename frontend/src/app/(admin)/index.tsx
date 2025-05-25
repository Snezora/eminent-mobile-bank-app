import adminSignUp from "@/src/components/AdminSignUp";
import SettingsLogOut from "@/src/components/SettingsLogOut";
import Colors from "@/src/constants/Colors";
import { supabase } from "@/src/lib/supabase";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, DateTimePicker } from "react-native-ui-lib";
import { useAuth } from "@/src/providers/AuthProvider";

var width = Dimensions.get("window").width; //full width

const AdminPage = () => {
  const colorScheme = useColorScheme();
  const { session } = useAuth();

  const data = [
    { value: 50, label: "2023-10-23" },
    { value: 80, label: "2023-10-24" },
    { value: 90, label: "2023-10-25" },
    { value: 70, label: "2023-10-26" },
    { value: 10, label: "2023-10-27" },
    { value: 40, label: "2023-10-28" },
    { value: 20, label: "2023-10-29" },
    { value: 30, label: "2023-10-30" },
    { value: 60, label: "2023-10-31" },
    { value: -50, label: "2023-11-01" },
  ];

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: Colors.light.themeColor }]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          paddingHorizontal: 20,
          gap: 5,
          paddingTop: 15,
          paddingBottom: 30,
        }}
      >
        <View style={[styles.header]}>
          <Text style={[styles.headerText]}>Admin Dashboard</Text>
          <SettingsLogOut />
        </View>
        <Text style={[styles.headerText]}>Good Evening, </Text>
        <Text style={[styles.headerText]}>Admin</Text>
      </View>
      <View style={[styles.container]}>
        <Card
          style={{
            overflowX: "hidden",
            width: width - 25,
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}
        >
          <Text>Cumulative Amount of Transfers (RM)</Text>
          <LineChart
            data={data}
            height={200}
            width={width - 100}
            spacing={100}
            isAnimated
            animateOnDataChange
            initialSpacing={50}
            // maxValue={data.reduce((max, item) => Math.max(max, item.value), 0)}
            // mostNegativeValue={data.reduce((min, item) => Math.min(min, item.value), 0)}
            endSpacing={30}
            yAxisLabelPrefix={"RM"}
            yAxisLabelWidth={50}
            showYAxisIndices
            scrollToEnd
          />
        </Card>
        <View style={[styles.lowerContainer]}>
          <Card
            style={[styles.cards]}
            onPress={() => router.push("/(admin)/transfers")}
          >
            <Text>Transfers</Text>
          </Card>
          <Card
            style={[styles.cards]}
            onPress={() => router.push("/(admin)/loans")}
          >
            <Text>Loans</Text>
          </Card>
          <Card style={[styles.cards]} onPress={() => router.push("/(admin)/accounts")}>
            <Text>Accounts</Text>
          </Card>
          <Card style={[styles.cards]} onPress={() => console.log(session)}>
            <Text>Profile</Text>
          </Card>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.themeColor,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    paddingVertical: 15,
    overflowX: "hidden",
    gap: 20,
  },
  lowerContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f3f3",
    overflowX: "hidden",
  },
  cards: {
    width: "45%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AdminPage;
