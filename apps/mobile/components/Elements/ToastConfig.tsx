import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import AlertCircleIcon from '@hugeicons/core-free-icons/AlertCircleIcon';
import InformationCircleIcon from '@hugeicons/core-free-icons/InformationCircleIcon';
import Alert02Icon from '@hugeicons/core-free-icons/Alert02Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import Toast, { BaseToastProps } from 'react-native-toast-message';
import { Colors } from '@/lib/colors';
import { Shadows } from "@/lib/styles";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CustomToastCardProps extends BaseToastProps {
  variant: 'success' | 'error' | 'info' | 'warning';
}

const toastThemes = {
  success: {
    borderColor: Colors.success.border,
    iconBg: Colors.success.bg,
    iconColor: Colors.mint,
    icon: CheckmarkCircle02Icon,
    accentColor: Colors.success.text,
  },
  error: {
    borderColor: Colors.danger.border,
    iconBg: Colors.danger.bg,
    iconColor: Colors.danger.text,
    icon: AlertCircleIcon,
    accentColor: Colors.danger.text,
  },
  warning: {
    borderColor: Colors.warning.border,
    iconBg: Colors.warning.bg,
    iconColor: Colors.warning.text,
    icon: Alert02Icon,
    accentColor: Colors.warning.text,
  },
  info: {
    borderColor: '#BFDBFE',
    iconBg: Colors.primaryLight,
    iconColor: Colors.primary,
    icon: InformationCircleIcon,
    accentColor: Colors.primaryDark,
  },
};

const CustomToastCard: React.FC<CustomToastCardProps> = ({ variant, text1, text2, onPress }) => {
  const theme = toastThemes[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress || (() => Toast.hide())}
      style={[Shadows.card, { borderColor: theme.borderColor, width: SCREEN_WIDTH * 0.9 }]}
      className="min-h-14 flex-row items-center bg-bolt-card py-3 px-3.5 rounded-2xl border"
    >
      {/* Icon Badge */}
      <View
        style={{ backgroundColor: theme.iconBg }}
        className="w-9.5 h-9.5 rounded-xl items-center justify-center mr-3"
      >
        <HugeiconsIcon icon={theme.icon} size={20} color={theme.iconColor} />
      </View>

      {/* Content */}
      <View className="flex-1 justify-center">
        {text1 ? (
          <Text className="text-sm font-poppins-semibold text-bolt-graphite leading-5" numberOfLines={1}>
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text className="text-xs font-inter text-bolt-slate mt-0.5 leading-4" numberOfLines={2}>
            {text2}
          </Text>
        ) : null}
      </View>

      {/* Dismiss button */}
      <TouchableOpacity
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() => Toast.hide()}
        className="p-1 ml-2 self-center"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const toastConfig = {
  success: (props: BaseToastProps) => <CustomToastCard variant="success" {...props} />,
  error: (props: BaseToastProps) => <CustomToastCard variant="error" {...props} />,
  info: (props: BaseToastProps) => <CustomToastCard variant="info" {...props} />,
  warning: (props: BaseToastProps) => <CustomToastCard variant="warning" {...props} />,
};
