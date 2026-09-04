// Alternative approach - Single hook with dynamic validation

import React from "react";

interface ErrorFields {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  businessName?: string;
}

interface UseValidationProps {
  setErrors: React.Dispatch<React.SetStateAction<ErrorFields>>;
}

export default function useValidation({ setErrors }: UseValidationProps) {
  const validateField = (name: string, value: string, password?: string) => {
    let error = "";
    
    switch (name) {
      case "fullName":
        if (!value) {
          error = "Fullname is required";
        } else if (value.length < 3) {
          error = "Name must be more than 2 characters";
        }
        break;
        
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
        
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be more than 6 characters";
        }
        break;
        
      case "confirmPassword":
        if (!value) {
          error = "Confirm Password is required";
        } else if (password && value !== password) {
          error = "Password and confirm password doesn't match";
        }
        break;
        
      case "phone":
        if (value && value.length < 10) {
          error = "Phone number must be at least 10 digits";
        }
        break;
        
      case "businessName":
        if (value && value.length < 2) {
          error = "Business name must be more than 1 character";
        }
        break;
    }
    
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };
  
  return { validateField };
}
