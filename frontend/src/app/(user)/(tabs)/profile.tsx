import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/src/constants/Colors";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Customer } from "@/assets/data/types";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import { Dropdown } from "react-native-element-dropdown";
import { NATIONALITIES } from "@/src/constants/Nationalities";

const profileSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .matches(
      /^\w+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .required("Username is required"),
  first_name: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .required("First name is required"),
  last_name: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .required("Last name is required"),
  phone_no: yup
    .string()
    .matches(/^[0-9]{8,15}$/, "Please enter a valid phone number (8-15 digits)")
    .required("Phone number is required"),
  home_address: yup
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be less than 200 characters")
    .required("Home address is required"),
  nationality: yup
    .string()
    .min(2, "Nationality must be at least 2 characters")
    .max(50, "Nationality must be less than 50 characters")
    .required("Nationality is required"),
  ic_no: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .matches(
      /^\d{6}-\d{2}-\d{4}$|^$/,
      "IC number must be in format XXXXXX-XX-XXXX"
    )
    .test(
      "at-least-one-id",
      "Either IC Number or Passport Number must be provided",
      function (value) {
        const { passport_no } = this.parent;
        return Boolean(value ?? passport_no);
      }
    ),
  passport_no: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .matches(
      /^[A-Z0-9]{6,12}$|^$/,
      "Passport number must be 6-12 alphanumeric characters"
    )
    .test(
      "at-least-one-id",
      "Either IC Number or Passport Number must be provided",
      function (value) {
        const { ic_no } = this.parent;
        return Boolean(value ?? ic_no);
      }
    ),
});

interface ProfileFormData {
  username: string;
  first_name: string;
  last_name: string;
  phone_no: string;
  home_address: string;
  nationality: string;
  ic_no: string | null | undefined;
  passport_no: string | null | undefined;
}

const getDarkTextColor = () => Colors.dark.text;
const getLightTextColor = () => Colors.light.text;
const getDarkPlaceholderColor = () => Colors.dark.text + "80";
const getLightPlaceholderColor = () => Colors.light.text + "80";
const getDarkBorderColor = () => Colors.dark.border;
const getLightBorderColor = () => Colors.light.border;

const getBorderColor = (hasError: boolean, isDarkMode: boolean) => {
  if (hasError) return Colors.light.themeColorReject;
  return isDarkMode ? getDarkBorderColor() : getLightBorderColor();
};

const getTextColorDark = () => getDarkTextColor();
const getTextColorLight = () => getLightTextColor();
const getPlaceholderColorDark = () => getDarkPlaceholderColor();
const getPlaceholderColorLight = () => getLightPlaceholderColor();

const getTextColor = (isDarkMode: boolean) => {
  if (isDarkMode) {
    return getTextColorDark();
  }
  return getTextColorLight();
};

const getPlaceholderColor = (isDarkMode: boolean) => {
  if (isDarkMode) {
    return getPlaceholderColorDark();
  }
  return getPlaceholderColorLight();
};

const FormInput: React.FC<{
  label: string;
  control: any;
  name: keyof ProfileFormData;
  errors: any;
  isDarkMode: boolean;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad";
  autoCapitalize?: "none" | "characters";
  disabled?: boolean;
  hideWhenDisabled?: boolean; // Add this new prop
}> = ({
  label,
  control,
  name,
  errors,
  isDarkMode,
  placeholder,
  multiline = false,
  keyboardType = "default",
  autoCapitalize = "none",
  disabled = false,
  hideWhenDisabled = false, // Default to false
}) => {
  // If hideWhenDisabled is true and field is disabled, don't render anything
  if (hideWhenDisabled && disabled) {
    return null;
  }

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: getTextColor(isDarkMode) }]}>
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              multiline && styles.textArea,
              {
                backgroundColor: disabled
                  ? isDarkMode
                    ? Colors.dark.background
                    : Colors.light.grayColor + "20"
                  : isDarkMode
                  ? Colors.dark.firstButton
                  : "white",
                color: disabled
                  ? getPlaceholderColor(isDarkMode)
                  : getTextColor(isDarkMode),
                borderColor: getBorderColor(errors[name], isDarkMode),
              },
            ]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value ?? ""}
            placeholder={placeholder}
            placeholderTextColor={getPlaceholderColor(isDarkMode)}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={!disabled}
            selectTextOnFocus={!disabled}
          />
        )}
      />
      {disabled && !hideWhenDisabled && (
        <View style={styles.disabledOverlay}>
          <Ionicons
            name="lock-closed"
            size={16}
            color={getPlaceholderColor(isDarkMode)}
          />
          <Text
            style={[
              styles.disabledText,
              { color: getPlaceholderColor(isDarkMode) },
            ]}
          >
            Requires biometric authentication
          </Text>
        </View>
      )}
      {errors[name] && (
        <Text style={styles.errorText}>{errors[name].message}</Text>
      )}
    </View>
  );
};

const FormDropdown: React.FC<{
  label: string;
  control: any;
  name: keyof ProfileFormData;
  errors: any;
  isDarkMode: boolean;
  placeholder: string;
  data: Array<{ label: string; value: string }>;
}> = ({ label, control, name, errors, isDarkMode, placeholder, data }) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, { color: getTextColor(isDarkMode) }]}>
      {label}
    </Text>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <Dropdown
          style={[
            styles.input,
            styles.dropdown,
            {
              backgroundColor: isDarkMode ? Colors.dark.firstButton : "white",
              borderColor: getBorderColor(errors[name], isDarkMode),
            },
          ]}
          placeholderStyle={[
            styles.dropdownPlaceholder,
            {
              color: getPlaceholderColor(isDarkMode),
            },
          ]}
          selectedTextStyle={[
            styles.dropdownSelectedText,
            {
              color: getTextColor(isDarkMode),
            },
          ]}
          itemTextStyle={{
            color: isDarkMode ? Colors.dark.text : Colors.light.text,
            fontSize: 16,
            backgroundColor: "transparent",
          }}
          containerStyle={[
            styles.dropdownContainer,
            {
              backgroundColor: isDarkMode ? Colors.dark.grayColor : "white",
              borderColor: getBorderColor(false, isDarkMode),
            },
          ]}
          data={data}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={placeholder}
          searchPlaceholder="Search nationality..."
          search
          value={value}
          onFocus={() => onBlur()}
          onChange={(item) => {
            onChange(item.value);
          }}
          renderRightIcon={() => (
            <Ionicons
              name="chevron-down"
              size={20}
              color={getPlaceholderColor(isDarkMode)}
            />
          )}
        />
      )}
    />
    {errors[name] && (
      <Text style={styles.errorText}>{errors[name].message}</Text>
    )}
  </View>
);

const Profile = () => {
  const router = useRouter();
  const { user, isBiometricAuthenticated, authenticateBiometric } = useAuth();
  const isDarkMode = useColorScheme() === "dark";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      phone_no: "",
      home_address: "",
      nationality: "",
      ic_no: "",
      passport_no: "",
    },
  });

  const isCustomer = user && "customer_id" in user;
  const customerId = isCustomer ? user.customer_id : null;

  const fetchCustomerData = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("Customer")
        .select("*")
        .eq("customer_id", customerId)
        .single();

      if (error) {
        console.error("Error fetching customer data:", error);
        Alert.alert("Error", "Failed to load profile data");
        return;
      }

      if (data) {
        setCustomerData(data);

        reset({
          username: data.username ?? "",
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone_no: data.phone_no ?? "",
          home_address: data.home_address ?? "",
          nationality: data.nationality ?? "",
          ic_no: data.ic_no ?? "",
          passport_no: data.passport_no ?? "",
        });

        if (data.date_of_birth) {
          setSelectedDate(new Date(data.date_of_birth));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [customerId, reset]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!customerId) {
      Alert.alert("Error", "User session not found. Please log in again.");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        username: data.username.trim(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone_no: data.phone_no.trim(),
        home_address: data.home_address.trim(),
        nationality: data.nationality.trim(),
        ic_no: data.ic_no?.trim() ?? null,
        passport_no: data.passport_no?.trim() ?? null,
        date_of_birth: selectedDate?.toISOString() ?? null,
      };

      const { error } = await supabase
        .from("Customer")
        .update(updateData)
        .eq("customer_id", customerId);

      if (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile. Please try again.");
        return;
      }

      Alert.alert("Success", "Your profile has been updated successfully!", [
        { text: "OK" },
      ]);

      setCustomerData({ ...customerData, ...updateData } as Customer);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={Colors.light.themeColor} />
        <Text
          style={{
            marginTop: 10,
            color: isDarkMode ? Colors.dark.text : Colors.light.text,
          }}
        >
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: Colors.light.themeColor,
        },
      ]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={[
          styles.content,
          {
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: Colors.light.themeColor,
                },
              ]}
            >
              <Text style={styles.avatarText}>
                {customerData?.first_name?.charAt(0)}
                {customerData?.last_name?.charAt(0)}
              </Text>
            </View>
            <Text
              style={[styles.profileName, { color: getTextColor(isDarkMode) }]}
            >
              {customerData?.first_name} {customerData?.last_name}
            </Text>
          </View>
          <FormInput
            label="Username*"
            control={control}
            name="username"
            errors={errors}
            isDarkMode={isDarkMode}
            placeholder="Enter username"
          />
          <FormInput
            label="First Name*"
            control={control}
            name="first_name"
            errors={errors}
            isDarkMode={isDarkMode}
            placeholder="Enter first name"
          />
          <FormInput
            label="Last Name*"
            control={control}
            name="last_name"
            errors={errors}
            isDarkMode={isDarkMode}
            placeholder="Enter last name"
          />
          <View style={styles.inputContainer}>
            <Text
              style={[styles.inputLabel, { color: getTextColor(isDarkMode) }]}
            >
              Date of Birth
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dateInput,
                {
                  backgroundColor: isDarkMode
                    ? Colors.dark.firstButton
                    : "white",
                  borderColor: getBorderColor(false, isDarkMode),
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={[
                  styles.dateInputText,
                  {
                    color: selectedDate
                      ? getTextColor(isDarkMode)
                      : getPlaceholderColor(isDarkMode),
                  },
                ]}
              >
                {selectedDate
                  ? dayjs(selectedDate).format("DD/MM/YYYY")
                  : "Select date of birth"}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={getPlaceholderColor(isDarkMode)}
              />
            </TouchableOpacity>
          </View>
          <FormInput
            label="Phone Number*"
            control={control}
            name="phone_no"
            errors={errors}
            isDarkMode={isDarkMode}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
          <FormInput
            label="Home Address*"
            control={control}
            name="home_address"
            errors={errors}
            isDarkMode={isDarkMode}
            placeholder="Enter home address"
            multiline
          />
          <FormDropdown
            label="Nationality*"
            control={control}
            name="nationality"
            errors={errors}
            isDarkMode={isDarkMode}
            placeholder="Select your nationality"
            data={NATIONALITIES}
          />
          {!isBiometricAuthenticated ? (
            <View
              style={[
                styles.lockedSection,
                {
                  backgroundColor: isDarkMode
                    ? Colors.dark.firstButton
                    : Colors.light.grayColor + "20",
                  borderColor: getBorderColor(false, isDarkMode),
                },
              ]}
            >
              <View style={styles.lockedContent}>
                <Ionicons
                  name="lock-closed"
                  size={32}
                  color={getPlaceholderColor(isDarkMode)}
                />
                <Text
                  style={[
                    styles.lockedTitle,
                    { color: getTextColor(isDarkMode) },
                  ]}
                >
                  Sensitive Information
                </Text>
                <Text
                  style={[
                    styles.lockedSubtitle,
                    { color: getPlaceholderColor(isDarkMode) },
                  ]}
                >
                  IC and Passport fields require biometric authentication
                </Text>
                <TouchableOpacity
                  style={[
                    styles.authenticateButton,
                    { backgroundColor: Colors.light.themeColor },
                  ]}
                  onPress={() => {
                    authenticateBiometric();
                  }}
                >
                  <Ionicons name="finger-print" size={16} color="white" />
                  <Text style={styles.authenticateButtonText}>
                    Authenticate
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <FormInput
                label="IC Number (Required - Either IC or Passport)"
                control={control}
                name="ic_no"
                errors={errors}
                isDarkMode={isDarkMode}
                placeholder="XXXXXX-XX-XXXX"
              />
              <FormInput
                label="Passport Number (Required - Either IC or Passport)"
                control={control}
                name="passport_no"
                errors={errors}
                isDarkMode={isDarkMode}
                placeholder="Enter passport number"
                autoCapitalize="characters"
              />
            </>
          )}
          <View style={styles.inputContainer}>
            <Text
              style={[styles.inputLabel, { color: getTextColor(isDarkMode) }]}
            >
              Account Created
            </Text>
            <View
              style={[
                styles.input,
                styles.disabledInput,
                {
                  backgroundColor: isDarkMode
                    ? Colors.dark.background
                    : Colors.light.grayColor + "20",
                  borderColor: getBorderColor(false, isDarkMode),
                },
              ]}
            >
              <Text
                style={[
                  styles.disabledInputText,
                  {
                    color: getPlaceholderColor(isDarkMode),
                  },
                ]}
              >
                {customerData?.created_at
                  ? dayjs(customerData.created_at).format("DD/MM/YYYY HH:mm")
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: saving
                ? Colors.light.themeColor + "80"
                : Colors.light.themeColor,
            },
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
        date={selectedDate || new Date()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
  },
  form: {
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInputText: {
    fontSize: 16,
  },
  disabledInput: {
    justifyContent: "center",
  },
  disabledInputText: {
    fontSize: 16,
  },
  errorText: {
    color: Colors.light.themeColorReject,
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    padding: 10,
    paddingTop: 10,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdown: {
    paddingVertical: 0,
    paddingHorizontal: 16,
  },
  dropdownContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    opacity: 1,
    backgroundColor: "white",
  },
  dropdownPlaceholder: {
    fontSize: 16,
  },
  dropdownSelectedText: {
    fontSize: 16,
  },
  disabledOverlay: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 5,
  },
  disabledText: {
    fontSize: 12,
    fontStyle: "italic",
  },
    lockedSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderStyle: 'dashed',
  },
  lockedContent: {
    alignItems: 'center',
    gap: 10,
  },
  lockedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockedSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  authenticateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 5,
  },
  authenticateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Profile;
