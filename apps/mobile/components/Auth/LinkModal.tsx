import React from "react";
import { GestureResponderEvent, Modal, View } from "react-native";
import { Button } from "../Elements/Buton";
import { InputField } from "../Elements/InputField";
import AuthHeader from "./AuthHeader";

interface LinkModalProps {
  password: string;
  setPassword: (value: string) => void;
  isLinking: boolean;
  handleLinking: (event: GestureResponderEvent) => void;
  visible: boolean;
}

export default function LinkModal({
  password,
  setPassword,
  isLinking,
  handleLinking,
  visible,
}: LinkModalProps) {
  // This component is used to link an account after sign-in
  return (
    <Modal
      animationType="slide"
      backdropColor={"#E6F0FF"}
      transparent={false}
      visible={visible}
      onRequestClose={() => {
        handleLinking;
      }}
    >
      <View className="flex-1 justify-center items-center ">
        {/* Modal content */}

        <View className="flex w-[90%] h-1/2 px-4 rounded-xl shadow-md bg-white m-auto justify-between items-center">
          {/* Header Section */}

          <AuthHeader
            title="Welcome back"
            label="Please link your account to continue"
          />
          {/* main */}
          <View className="w-full flex mt-12 flex-col gap-4 pb-24">
            <InputField
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              autoComplete="password"
            />
            <Button
              label={isLinking ? "Linking..." : "Link Account"}
              onPress={handleLinking}
              iconName={"link"}
              disabled={false}
              isChecked={true}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
