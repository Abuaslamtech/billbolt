import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import { Colors } from "@/lib/colors";

interface DebtorSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function DebtorSearchBar({
  value,
  onChangeText,
  placeholder = "Search customer name or phone...",
}: DebtorSearchBarProps) {
  return (
    <View className="bg-bolt-card border border-bolt-border rounded-xl flex-row items-center px-3.5 h-12 mb-3">
      <HugeiconsIcon icon={Search01Icon} size={18} color={Colors.slate} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.slate}
        className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite py-0"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          className="p-1.5 rounded-full bg-bolt-divider active:bg-bolt-border"
          accessibilityRole="button"
          accessibilityLabel="Clear search text"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} color={Colors.slate} />
        </TouchableOpacity>
      )}
    </View>
  );
}
