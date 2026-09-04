import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import useAuth from "./useAuth";
import useValidation from "./useValidation";

export interface ErrorFields {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  businessName?: string;
}

export function useSignUpScreen() {
  const [step, setStep] = useState<1 | 2>(1);

  // User Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Business Info
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState<ErrorFields>({});

  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const { validateField } = useValidation({ setErrors });

  const hasErrors = Object.values(errors).some((val) => Boolean(val));

  const handleBlur = (name: string, value: string, pass?: string) => {
    validateField(name, value, pass);
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const avatarPicker = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({
          type: "warning",
          text1: "Permission Required",
          text2: "Allow photo access in Settings to upload a profile photo.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setAvatar(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Avatar picker error:", err);
    }
  };

  const handleGoogleSignUp = async () => {
    await signInWithGoogle();
  };

  const handleSubmit = async () => {
    signUpWithEmail({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      phone: phone.trim(),
      businessName: businessName.trim(),
      businessType: businessType.trim(),
      avatar,
      setLoading,
    });
  };

  return {
    step,
    setStep,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    businessName,
    setBusinessName,
    businessType,
    setBusinessType,
    phone,
    setPhone,
    avatar,
    showPassword,
    togglePassword,
    showConfirmPassword,
    toggleConfirmPassword,
    loading,
    avatarLoading,
    focusedField,
    setFocusedField,
    isChecked,
    setIsChecked,
    errors,
    hasErrors,
    handleBlur,
    handleNextStep,
    avatarPicker,
    handleGoogleSignUp,
    handleSubmit,
  };
}
