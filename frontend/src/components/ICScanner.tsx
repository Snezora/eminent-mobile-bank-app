import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/Colors';

interface ICData {
  ic_number: string;
  name: string;
}

interface ICCameraScannerProps {
  onICDetected: (data: ICData) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const ICCameraScanner: React.FC<ICCameraScannerProps> = ({
  onICDetected,
  onClose,
  isDarkMode,
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [icNumber, setIcNumber] = useState('');
  const [name, setName] = useState('');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "Camera roll permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      "Add IC Photo",
      "Choose how you want to add the IC photo",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Photo Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const validateICNumber = (ic: string): boolean => {
    const icRegex = /^\d{6}-\d{2}-\d{4}$/;
    return icRegex.test(ic.trim());
  };

  const formatICNumber = (text: string): string => {
    // Remove all non-numeric characters
    const numbers = text.replace(/\D/g, '');
    
    // Format as XXXXXX-XX-XXXX
    if (numbers.length <= 6) {
      return numbers;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 6)}-${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 6)}-${numbers.slice(6, 8)}-${numbers.slice(8, 12)}`;
    }
  };

  const handleICNumberChange = (text: string) => {
    const formatted = formatICNumber(text);
    setIcNumber(formatted);
  };

  const handleSubmit = () => {
    if (!icNumber.trim()) {
      Alert.alert('Error', 'Please enter the IC number');
      return;
    }

    if (!validateICNumber(icNumber)) {
      Alert.alert('Error', 'Please enter a valid IC number in format XXXXXX-XX-XXXX');
      return;
    }

    Alert.alert(
      'Confirm IC Information',
      `IC Number: ${icNumber}${name ? `\nName: ${name}` : ''}\n\nIs this information correct?`,
      [
        {
          text: 'Edit',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            onICDetected({
              ic_number: icNumber.trim(),
              name: name.trim(),
            });
          },
        },
      ]
    );
  };

  const backgroundColor = isDarkMode ? Colors.dark.background : 'white';
  const textColor = isDarkMode ? Colors.dark.text : Colors.light.text;
  const borderColor = isDarkMode ? Colors.dark.border : Colors.light.border;
  const inputBgColor = isDarkMode ? Colors.dark.firstButton : 'white';

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          IC Information
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.light.themeColor} />
          <Text style={[styles.instructionsText, { color: textColor }]}>
            Take a clear photo of your IC and enter the details manually for accuracy.
          </Text>
        </View>

        {/* Image Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            IC Photo (Optional)
          </Text>
          <TouchableOpacity
            style={[
              styles.imageContainer,
              {
                backgroundColor: inputBgColor,
                borderColor: borderColor,
              },
            ]}
            onPress={showImagePicker}
          >
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={showImagePicker}
                >
                  <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={48} color="#999" />
                <Text style={styles.imagePlaceholderText}>Tap to add IC photo</Text>
                <Text style={styles.imagePlaceholderSubtext}>
                  This helps verify your identity
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Manual Entry Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Enter IC Details
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: textColor }]}>
              IC Number *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBgColor,
                  color: textColor,
                  borderColor: borderColor,
                },
              ]}
              value={icNumber}
              onChangeText={handleICNumberChange}
              placeholder="XXXXXX-XX-XXXX"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={14}
            />
            <Text style={styles.inputHint}>
              Enter 12 digits (will be auto-formatted)
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: textColor }]}>
              Full Name (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBgColor,
                  color: textColor,
                  borderColor: borderColor,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter name as shown on IC"
              placeholderTextColor="#999"
              autoCapitalize="words"
            />
            <Text style={styles.inputHint}>
              This will auto-fill your profile name fields
            </Text>
          </View>
        </View>

        {/* Example Section */}
        <View style={[styles.exampleContainer, { backgroundColor: inputBgColor, borderColor: borderColor }]}>
          <Text style={[styles.exampleTitle, { color: textColor }]}>
            Example IC Format
          </Text>
          <Text style={[styles.exampleText, { color: Colors.light.themeColor }]}>
            123456-78-9012
          </Text>
          <Text style={[styles.exampleSubtext, { color: '#666' }]}>
            Birth date - Birth place - Random digits
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton, 
            { 
              backgroundColor: icNumber.trim() ? Colors.light.themeColor : '#ccc',
            }
          ]}
          onPress={handleSubmit}
          disabled={!icNumber.trim()}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.submitButtonText}>Use This Information</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    padding: 15,
    backgroundColor: Colors.light.themeColor + '10',
    borderRadius: 12,
    gap: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.light.themeColor,
    borderRadius: 20,
    padding: 8,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePlaceholderSubtext: {
    marginTop: 5,
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  exampleContainer: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exampleSubtext: {
    fontSize: 12,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ICCameraScanner;