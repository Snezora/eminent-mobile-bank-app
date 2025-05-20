import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AccountBasicInfoProps } from "../types";

// https://www.npmjs.com/package/react-native-element-dropdown

const DropdownComponent = ({
  data,
  style,
  labelField,
  valueField,
  onSelect,
}: {
  data: any;
  style?: any;
  labelField?: string | number | symbol;
  valueField?: string | number | symbol;
  onSelect?: (item: AccountBasicInfoProps) => void;
}) => {
  const [value, setValue] = useState(data[0]);
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={300}
        labelField={labelField ?? "label"}
        valueField={valueField ?? "value"}
        placeholder={!isFocus ? "Select Account" : "..."}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => {
          setIsFocus(true);
        }}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item);
          onSelect?.(item);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <MaterialIcons
            style={styles.icon}
            color={isFocus ? "blue" : "black"}
            name="account-balance"
            size={20}
          />
        )}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
  },
  dropdown: {
    height: 40,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
