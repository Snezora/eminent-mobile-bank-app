import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Button,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import { router, Tabs, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { Account } from "@/assets/data/types";
import SwitchSelector from "react-native-switch-selector";
import * as Brightness from "expo-brightness";
import QRCode from "react-native-qrcode-svg";
import { Dimensions } from "react-native";
import CryptoJS from "crypto-js";
import { useMemo } from "react";

export default function Camera() {
  const colorScheme = useColorScheme();
  const rawSelectedAccount = useLocalSearchParams();
  const selectedAccount = useMemo(
    () => rawSelectedAccount,
    [rawSelectedAccount]
  );
  const isDarkMode = colorScheme === "dark";
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false); // Track if QR code has been scanned
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState("scan");
  const [torchOpen, setTorchOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [brightness, setBrightness] = useState(0.5);
  const bottomContainerHeight = useRef(0);
  const backendUrl = process.env.EXPO_PUBLIC_LOCALTUNNEL_URL;
  const { height: screenHeight } = Dimensions.get("window");
  const [encryptedData, setEncryptedData] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const SECRETKEY = process.env.EXPO_PUBLIC_SECRETQRKEY;
  const [countdown, setCountdown] = useState(30);
  const { account_no } = useLocalSearchParams();
  let debounceTimeout: NodeJS.Timeout | null = null;

  const options = [
    { label: "Scan", value: "scan" },
    { label: "Receive", value: "receive" },
  ];

  useEffect(() => {
    if (!permission?.granted) {
      Alert.alert(
        "Camera Permission Required",
        "This app needs camera access to scan QR codes and generate payment QR codes.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => router.back(),
          },
          {
            text: "Grant Permission",
            onPress: async () => {
              const result = await requestPermission();
              if (!result.granted) {
                Alert.alert(
                  "Permission Denied",
                  "Camera access is required for QR code functionality. You can enable it in Settings.",
                  [
                    {
                      text: "Go Back",
                      onPress: () => router.back(),
                    },
                    {
                      text: "Open Settings",
                      onPress: () => Linking.openSettings(),
                    },
                  ]
                );
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, [permission?.granted]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    bottomContainerHeight.current = height; // Save the height
  };

  const encryptData = async () => {
    setQrLoading(true);
    try {
      const qrJSON = JSON.stringify({
        app: "EminentWesternBank",
        receiver_account_no: selectedAccount.account_no,
        time_created: new Date().toISOString(),
      });

      const encrypted = CryptoJS.AES.encrypt(qrJSON, SECRETKEY).toString();

      setEncryptedData(encrypted);
    } catch (error) {
      console.error("Error encrypting data:", error);
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    const handleBrightness = async () => {
      setBrightness(await Brightness.getBrightnessAsync());
      if (selectedOption === "receive") {
        // await Brightness.setBrightnessAsync(1);
        return;
      }
      Brightness.setBrightnessAsync(brightness);
    };

    if (selectedOption === "scan") {
      setTimeout(() => {
        setHasScanned(false);
        setCameraActive(true);
      }, 2000);
    }

    if (countdown === 30) {
      encryptData();
    }
    handleBrightness();

    return () => {
      Brightness.setBrightnessAsync(brightness);
    };
  }, [selectedOption]);

  useEffect(() => {
    const interval = setInterval(() => {
      encryptData();
      setCountdown(30);
    }, 30000);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        const newValue = prev > 0 ? prev - 1 : 30;
        return newValue;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [JSON.stringify(selectedAccount)]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <ActivityIndicator size="large" color={Colors.light.themeColor} />
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  function handleBarcodeScanned({ data }: { data: string }) {
    setHasScanned(true);
    if (debounceTimeout || hasScanned) return;
    debounceTimeout = setTimeout(() => {
      debounceTimeout = null;
    }, 5000);
    setCameraActive(false);

    try {
      // Decrypt the scanned QR code data
      const bytes = CryptoJS.AES.decrypt(data, SECRETKEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      if (decryptedData.app !== "EminentWesternBank") {
        throw new Error("Invalid QR code");
      }

      if (decryptedData) {
        // Reject the QR code 45 seconds after the date
        if (
          new Date().getTime() >
          new Date(decryptedData.time_created).getTime() + 45000
        ) {
          Alert.alert(
            "QR code has expired",
            "Please scan a valid QR code.",
            [
              {
                text: "OK",
                onPress: () => {
                  setHasScanned(false); // Re-enable scanning
                  setCameraActive(true); // Re-enable the camera
                },
              },
            ],
            { cancelable: false }
          );
          return;
        }

        if (decryptedData.receiver_account_no === account_no) {
          Alert.alert("Error", "You cannot transfer to the same account.", [
            { text: "OK" },
          ]);
          return;
        }
        // Push to the newTransfer page with the scanned data
        router.push({
          pathname: "/(user)/(transfer)/newTransfer",
          params: {
            bankName: "EWB",
            account_no: decryptedData.receiver_account_no,
            transfer_account: account_no,
          },
        });
      } else {
        throw new Error("Invalid QR code");
      }
    } catch (error) {
      console.error("Error decrypting data:", error);
      Alert.alert(
        "Error",
        "An error occurred while processing the QR code.",
        [
          {
            text: "OK",
            onPress: () => {
              setHasScanned(false); // Re-enable scanning
              setCameraActive(true); // Re-enable the camera
            },
          },
        ],
        { cancelable: false }
      );
    } finally {
      if (!cameraActive) {
        setTimeout(() => {
          setHasScanned(false); // Re-enable scanning after a delay
          setCameraActive(true); // Re-enable the camera
        }, 1000); // Add a delay to prevent immediate re-scanning
      }
    }
  }

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#385A93" }]}
      edges={["top"]}
    >
      <View style={styles.container}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        {!cameraActive && (
          <View
            style={[
              styles.qrContainer,
              {
                height: screenHeight - 100 - bottomContainerHeight.current,
                backgroundColor: isDarkMode
                  ? Colors.dark.background
                  : Colors.light.background,
              },
            ]}
          >
            <TouchableOpacity
              style={{ alignItems: "center", gap: 10 }}
              onPress={() => {
                setCameraActive(true);
                setHasScanned(false);
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                Reload
              </Text>
              <Ionicons
                name="reload-circle-outline"
                size={50}
                color="white"
              ></Ionicons>
            </TouchableOpacity>
          </View>
        )}
        {selectedOption === "scan" && cameraActive && (
          <CameraView
            active={cameraActive}
            style={styles.camera}
            facing={facing}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
          ></CameraView>
        )}
        {selectedOption === "receive" && encryptedData && (
          <View
            style={[
              styles.qrContainer,
              {
                height: screenHeight - 100 - bottomContainerHeight.current,
                backgroundColor: isDarkMode
                  ? Colors.dark.background
                  : Colors.light.background,
              },
            ]}
          >
            {qrLoading && (
              <View>
                <ActivityIndicator size="large" color="white" />
              </View>
            )}
            {!qrLoading && (
              <View style={{ alignItems: "center", gap: 10 }}>
                <QRCode
                  value={encryptedData}
                  size={250}
                  backgroundColor={
                    isDarkMode
                      ? Colors.dark.background
                      : Colors.light.background
                  }
                  color={isDarkMode ? Colors.dark.text : Colors.light.text}
                />
                <Text
                  style={[
                    styles.countdownText,
                    {
                      color: isDarkMode ? Colors.dark.text : Colors.light.text,
                    },
                  ]}
                >
                  Refreshing in: {countdown}s
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    encryptData();
                    setCountdown(30);
                  }} // Call encryptData to manually refresh
                  style={styles.refreshButton}
                >
                  <Text style={styles.refreshButtonText}>Refresh Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        <View
          style={[
            styles.bottomContainer,
            {
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              paddingBottom: 100,
            },
          ]}
          onLayout={handleLayout}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 50,
              width: "100%",
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: "center",
                // transform: [{ translateX: 24 }],
              }}
            >
              <View
                style={{
                  // backgroundColor: Colors.dark.text,
                  padding: 10,
                  borderRadius: 20,
                  alignSelf: "center",
                }}
              >
                <Text style={[styles.text, { color: "white" }]}>
                  Scan & Receive
                </Text>
              </View>
            </View>
            {/* <TouchableOpacity
              onPress={() => {
                setTorchOpen(!torchOpen);
                console.log(torchOpen);
              }}
              style={{
                backgroundColor: Colors.light.themeColor,
                padding: 10,
                borderRadius: 20,
              }}
            >
              <Ionicons name="flash" size={24} color="white" />
            </TouchableOpacity> */}
          </View>

          <SwitchSelector
            style={{ alignSelf: "center", width: "50%" }}
            initial={0}
            onPress={(value: string | number) => {
              setSelectedOption(value as string);
            }}
            hasPadding
            options={options}
            selectedColor="white"
            buttonColor={Colors.light.themeColor}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    // maxHeight: "60%",
    // height: "60%",
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  countdownText: {
    marginTop: 10,
    fontSize: 16,
  },
  refreshButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.themeColor,
    borderRadius: 10,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  permissionContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.themeColor,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
    fontSize: 16,
    marginTop: 20,
  },
});
