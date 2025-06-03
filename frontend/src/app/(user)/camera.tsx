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
import SimpleCrypto from "simple-crypto-js";
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

  const options = [
    { label: "Scan", value: "scan" },
    { label: "Receive", value: "receive" },
  ];

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    bottomContainerHeight.current = height; // Save the height
    console.log("Bottom container height:", height); // Log the height
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
      console.log(qrJSON);

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
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  function handleBarcodeScanned({ data }: { data: string }) {
    if (hasScanned) return; // Prevent multiple scans
    setHasScanned(true); // Disable further scans immediately
    setCameraActive(false); // Disable the camera

    try {
      // Decrypt the scanned QR code data
      const bytes = CryptoJS.AES.decrypt(data, SECRETKEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      if (decryptedData.app !== "EminentWesternBank") {
        throw new Error("Invalid QR code");
      }

      // Reject the QR code 45 seconds after the date
      if (
        new Date().getTime() >
        new Date(decryptedData.time_created).getTime() + 45000
      ) {
        Alert.alert("QR code has expired");
      } else {
        console.log("Decrypted data:", decryptedData);
      }
    } catch (error) {
      console.error("Error decrypting data:", error);
    } finally {
      setTimeout(() => {
        setHasScanned(false);
        setCameraActive(true);
      }, 2000);
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
        {selectedOption === "scan" && (
          <CameraView
            active={cameraActive}
            style={styles.camera}
            facing={facing}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleBarcodeScanned}
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
              <>
                <QRCode
                  value={encryptedData}
                  size={200}
                  backgroundColor={
                    isDarkMode
                      ? Colors.dark.background
                      : Colors.light.background
                  }
                  color={isDarkMode ? Colors.dark.text : Colors.light.text}
                />
                <Text style={styles.countdownText}>
                  Refreshing in: {countdown}s
                </Text>
                <TouchableOpacity
                  onPress={() => {encryptData(); setCountdown(30);}} // Call encryptData to manually refresh
                  style={styles.refreshButton}
                >
                  <Text style={styles.refreshButtonText}>Refresh Now</Text>
                </TouchableOpacity>
              </>
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
  message: {
    textAlign: "center",
    paddingBottom: 10,
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
    color: "white",
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
});
