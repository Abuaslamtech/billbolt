import { useState } from "react";
import auth from "@react-native-firebase/auth";
import Toast from "react-native-toast-message";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your registered email address.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
      });
      return;
    }

    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email.trim());
      setIsSubmitted(true);
      Toast.show({
        type: "success",
        text1: "Reset Email Sent",
        text2: "Check your inbox for password reset instructions.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      let message = "Could not send reset email. Please try again.";
      if (error?.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error?.code === "auth/invalid-email") {
        message = "The email address is invalid.";
      }
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    isSubmitted,
    handleResetPassword,
  };
}
