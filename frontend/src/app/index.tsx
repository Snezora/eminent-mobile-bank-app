import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-ui-lib";
import { Dimensions } from "react-native";
import { useAuth } from "../providers/AuthProvider";

var width = Dimensions.get('window').width; //full width
var height = Dimensions.get('window').height; //full height

const IndexPage = () => {
  const { session, user } = useAuth();

  return (
    <View style={styles.container}>
      <Link href={"/(user)"} asChild>
        <Button label="User" />
      </Link>
      <Link href={'/(admin)'} asChild>
        <Button label="Admin" />
      </Link>
      <Link href={'/(auth)/home-page'} asChild>
        <Button label="Auth" />
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 50,
  },
});

export default IndexPage;
