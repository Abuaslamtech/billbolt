import { useEffect, useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import useAuth from "./useAuth";
import { useBiometric } from "./useBiometric";

export function useLoginScreen() {
  // Initialize google sign-in module
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "381178769112-s39q38b0r1hkuvg974li9fnnp5b2lir2.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Auth operations
  const {
    isLoading,
    isGoogleLoading,
    signInWithEmail,
    signInWithGoogle,
    LinkAccount,
  } = useAuth();

  // Biometric integration
  const { hasBiometric, handleBiometricSignIn } = useBiometric();

  const handleGoogleSignIn = async () => {
    const data = await signInWithGoogle({ setIsModalVisible });
    if (data) {
      setIdToken(data.idToken);
      if (data.email) setEmail(data.email);
    }
  };

  const handleSignIn = () => {
    signInWithEmail(email, password);
  };

  const handleLinking = async () => {
    await LinkAccount({ email, idToken, password, setIsLinking });
    setIsModalVisible(false);
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePassword,
    isLoading,
    isGoogleLoading,
    hasBiometric,
    handleBiometricSignIn,
    handleSignIn,
    handleGoogleSignIn,
    // Modal linking state
    isModalVisible,
    setIsModalVisible,
    isLinking,
    handleLinking,
  };
}
