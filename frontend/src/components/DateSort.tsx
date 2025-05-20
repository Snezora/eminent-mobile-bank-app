import { useState } from "react";
import { Dropdown } from "react-native-element-dropdown";

const dateSort = [
  { label: "Ascending", value: "ascending" },
  { label: "Descending", value: "descending" },
];

const DateSort = (dateOrder: string, filtered: any[]) => {
  if (dateOrder === "ascending") {
    filtered.sort(
      (
        a: { transfer_datetime: string | number | Date },
        b: { transfer_datetime: string | number | Date }
      ) => {
        const dateA = new Date(a.transfer_datetime).getTime();
        const dateB = new Date(b.transfer_datetime).getTime();
        return dateA - dateB;
      }
    );
  } else {
    filtered.sort(
      (
        a: { transfer_datetime: string | number | Date },
        b: { transfer_datetime: string | number | Date }
      ) => {
        const dateA = new Date(a.transfer_datetime).getTime();
        const dateB = new Date(b.transfer_datetime).getTime();
        return dateB - dateA;
      }
    );
  }

  return filtered;
};

const DateSortComponent = ({
  dateOrder,
  setDateOrder,
}: {
  dateOrder: string;
  setDateOrder: any;
}) => {
  return (
    <Dropdown
      value={dateOrder}
      data={dateSort}
      onChange={(value) => {
        setDateOrder(value.value);
      }}
      labelField={"label"}
      valueField={"value"}
      containerStyle={{
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: "white",
        padding: 10,
      }}
      style={{
        borderRadius: 10,
        backgroundColor: "white",
        padding: 10,
        borderColor: "black",
        borderWidth: 1,
        marginTop: 10,
        marginBottom: 20,
      }}
    />
  );
};

export { DateSort, DateSortComponent };
