import Colors from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabView, SceneMap, TabBar, TabBarProps } from "react-native-tab-view";
import TransferSelfPage from "./transferSelf";
import TransferOthersPage from "./transferOthers";

const FirstRoute = () => (
  <View style={[styles.container, { backgroundColor: "#ff4081" }]}>
    <Text>First Page</Text>
  </View>
);

const SecondRoute = () => (
  <View style={[styles.container, { backgroundColor: "#673ab7" }]} />
);

const renderScene = ({route}) => {
  switch (route.key) {
    case "self":
      return <TransferSelfPage />
    case "others":
      return <TransferOthersPage />;
    default:
      return null;
  }
}

const routes = [
  { key: "self", title: "Self" },
  { key: "others", title: "Others" },
];

const renderTabBar = (props: TabBarProps<any>) => (
  <TabBar
    {...props}
    indicatorStyle={{
      backgroundColor: Colors.light.themeColorTertiary,
      height: 5,
    }}
    style={{ backgroundColor: Colors.light.themeColor }}
  />
);

const TransferPage = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#385A93" }]}
      edges={["top"]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingTop: 10,
          paddingHorizontal: 10,
        }}
      >
        <Ionicons name="chevron-back-outline" size={24} color="white" />
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
          Back
        </Text>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        commonOptions={{
          label: ({ route, labelText, focused, color }) => (
            <Text style={{ color, margin: 8, fontSize: 15 }}>{labelText ?? route.name}</Text>
          ),
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
});

export default TransferPage;
