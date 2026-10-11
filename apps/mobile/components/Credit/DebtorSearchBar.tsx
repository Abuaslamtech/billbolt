import React from "react";
import SearchBar, { SearchBarProps } from "@/components/Elements/SearchBar";

export interface DebtorSearchBarProps extends Partial<SearchBarProps> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function DebtorSearchBar({
  value,
  onChangeText,
  placeholder = "Search customer name or phone...",
  ...props
}: DebtorSearchBarProps) {
  return (
    <SearchBar
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      containerClassName="mb-3"
      {...props}
    />
  );
}
