declare module "react-native-switch-selector" {
  import { Component } from "react";
  import { ViewStyle, TextStyle } from "react-native";

  interface SwitchSelectorOption {
    label: string;
    value: string | number;
    customIcon?: JSX.Element;
    imageIcon?: JSX.Element;
    activeColor?: string;
  }

  interface SwitchSelectorProps {
    options: SwitchSelectorOption[];
    initial?: number;
    onPress: (value: string | number) => void;
    style?: ViewStyle;
    buttonColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    selectedColor?: string;
    fontSize?: number;
    bold?: boolean;
    textStyle?: TextStyle;
    selectedTextStyle?: TextStyle;
    borderRadius?: number;
    height?: number;
    animationDuration?: number;
    disabled?: boolean;
    disableValueChangeOnPress?: boolean;
    hasPadding?: boolean;
    valuePadding?: number;
    buttonMargin?: number;
    returnObject?: boolean;
    accessibilityLabel?: string;
    testID?: string;
  }

  export default class SwitchSelector extends Component<SwitchSelectorProps> {
    constructor(props: SwitchSelectorProps);
    state: {
      selected: any;
    };
    panResponder: any;
    animatedValue: any;
    componentDidUpdate(prevProps: SwitchSelectorProps): void;
    getSwipeDirection(gestureState: any): "RIGHT" | "LEFT";
    getBgColor(): any;
    responderEnd(evt: any, gestureState: any): void;
    shouldSetResponder(evt: any, gestureState: any): boolean;
    animate(value: any, last: any): void;
    toggleItem(index: any, callOnPress?: boolean): void;
    render(): any;
  }

  namespace SwitchSelector {
    export const defaultProps: {
      style: ViewStyle;
      textStyle: TextStyle;
      selectedTextStyle: TextStyle;
      textContainerStyle: ViewStyle;
      selectedTextContainerStyle: ViewStyle;
      imageStyle: ViewStyle;
      options: SwitchSelectorOption[];
      textColor: string;
      selectedColor: string;
      fontSize: number;
      backgroundColor: string;
      borderColor: string;
      borderRadius: number;
      borderWidth: number;
      hasPadding: boolean;
      valuePadding: number;
      height: number;
      bold: boolean;
      buttonMargin: number;
      buttonColor: string;
      returnObject: boolean;
      animationDuration: number;
      disabled: boolean;
      disableValueChangeOnPress: boolean;
      initial: number;
      value: number;
      onPress: (value: string | number) => void;
      accessibilityLabel: string;
      testID: string;
    };

    export const propTypes: {
      style: any;
      textStyle: any;
      selectedTextStyle: any;
      textContainerStyle: any;
      selectedTextContainerStyle: any;
      imageStyle: any;
      options: any;
      textColor: any;
      selectedColor: any;
      fontSize: any;
      backgroundColor: any;
      borderColor: any;
      borderRadius: any;
      borderWidth: any;
      hasPadding: any;
      valuePadding: any;
      height: any;
      bold: any;
      buttonMargin: any;
      buttonColor: any;
      returnObject: any;
      animationDuration: any;
      disabled: any;
      disableValueChangeOnPress: any;
      initial: any;
      value: any;
      onPress: any;
      accessibilityLabel: any;
      testID: any;
    };
  }
}