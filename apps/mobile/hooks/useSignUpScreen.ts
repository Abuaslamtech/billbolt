import { useState } from "react";
import useAuth from "./useAuth";
import useValidation from "./useValidation";

export interface ErrorFields {
  fullName?: string;
  email?: string;
  password?: string;
}

export function useSignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState<ErrorFields>({});

  const { signUpWithEmail, signInWithGoogle, isGoogleLoading } = useAuth();
  const { validateField } = useValidation({ setErrors });

  const hasErrors = Object.values(errors).some((val) => Boolean(val));
  const isFormValid = Boolean(
    fullName.trim() &&
    email.trim() &&
    password.length >= 6 &&
    isChecked &&
    !hasErrors
  );

  const handleBlur = (name: string, value: string) => {
    validateField(name, value);
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleGoogleSignUp = async () => {
    await signInWithGoogle();
  };

  const handleSubmit = async () => {
    if (!isFormValid || loading) return;

    await signUpWithEmail({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      setLoading,
    });
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePassword,
    loading: loading || isGoogleLoading,
    focusedField,
    setFocusedField,
    isChecked,
    setIsChecked,
    errors,
    hasErrors,
    isFormValid,
    handleBlur,
    handleGoogleSignUp,
    handleSubmit,
  };
}
