import { StyleSheet } from "react-native";

const lightTheme = {
  backgroundColor: "#eeeeee",
  textColor: "black",
};

const darkTheme = {
  backgroundColor: "#4A4A4A",
  textColor: "#E0E0E0",
};

const topLightTheme = {
  backgroundColor: "#829CC8",
  textColor: "black",
};

const topDarkTheme = {
  backgroundColor: "#385A93",
  textColor: "white",
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingTop: 20,
  },
  topContainer: {
    paddingLeft: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  accNo: {
    fontSize: 16,
    color: "white",
    marginTop: 20,
    marginBottom: 15,
    fontWeight: "bold",
  },
});

const getThemeStyles = (colorScheme) => {
  if (colorScheme === "light") {
    return {
      centerContainerStyle: [styles.centerContainer, lightTheme],
      centerTextStyle: lightTheme.textColor,
      topContainerStyle: [styles.topContainer, topLightTheme],
      topTextStyle: topLightTheme.textColor,
    };
  } else {
    return {
      centerContainerStyle: [styles.centerContainer, darkTheme],
      centerTextStyle: darkTheme.textColor,
      topContainerStyle: [styles.topContainer, topDarkTheme],
      topTextStyle: topDarkTheme.textColor,
    };
  }
};

export { getThemeStyles };