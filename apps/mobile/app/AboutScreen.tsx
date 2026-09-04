import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ArrowLeft02Icon,
  ArrowUpRight01Icon,
  Globe02Icon,
  Mail02Icon,
  File02Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";

import { Colors } from "@/lib/colors";
import BackButton from "@/components/Elements/BackButton";
import { Shadows } from "@/lib/styles";

const APP_VERSION = "1.0.0";

const billboltLogo = require("@/assets/images/icon.png");
const atlabxLogo = require("@/assets/images/atlabx.png");

type LinkRowProps = {
  icon: any;
  label: string;
  href?: string;
  onPress?: () => void;
};

function LinkRow({ icon, label, href, onPress }: LinkRowProps) {
  const handlePress = () => {
    if (href) Linking.openURL(href).catch(() => { });
    else onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center px-4 py-3.5 border-b border-bolt-border last:border-0 active:bg-bolt-divider"
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <View className="w-9 h-9 rounded-xl bg-bolt-light items-center justify-center mr-3">
        <HugeiconsIcon icon={icon} size={18} color={Colors.primary} />
      </View>
      <Text className="flex-1 text-sm font-inter-medium text-bolt-graphite">
        {label}
      </Text>
      <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} color={Colors.slate} />
    </TouchableOpacity>
  );
}

export default function AboutScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top", "left", "right"]}
    >
      {/* Top bar */}
      <View className="flex-row items-center px-4 py-3 bg-bolt-card border-b border-bolt-border">
        <BackButton />
        <Text className="text-lg font-poppins-bold text-bolt-graphite flex-1">
          About Billbolt
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Logo Hero */}
        <View className="items-center py-8 bg-bolt-card border-b border-bolt-border">
          <View
            style={Shadows.primaryButton}
          >
            <Image
              source={billboltLogo}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-2xl font-poppins-bold text-bolt-blue">
            Billbolt
          </Text>
          <Text className="text-xs font-inter-medium text-bolt-slate mt-0.5">
            Smart business made simple
          </Text>

          <View className="mt-3 flex-row gap-2">
            <View className="bg-bolt-light border border-bolt-blue/20 rounded-full px-3 py-0.5">
              <Text className="text-2xs font-inter-semibold text-bolt-blue">
                v{APP_VERSION}
              </Text>
            </View>
            <View className="bg-bolt-divider rounded-full px-3 py-0.5">
              <Text className="text-2xs font-inter-semibold text-bolt-slate">
                Stable Release
              </Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View className="mx-4 mt-5 bg-bolt-card rounded-2xl border border-bolt-border p-4 shadow-sm">
          <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-wider mb-2">
            About Billbolt
          </Text>
          <Text className="text-sm font-inter text-bolt-slate leading-6">
            Billbolt empowers retail shops, boutiques, and merchants across Nigeria and Africa to manage sales, track inventory, and issue professional receipts seamlessly online or completely offline.
          </Text>
        </View>

        {/* Resources & Links */}
        <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-widest mx-4 mt-6 mb-2">
          Company & Support
        </Text>
        <View className="mx-4 bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden shadow-sm">
          <LinkRow
            icon={Globe02Icon}
            label="Visit Website"
            href="https://billbolt.atlabx.com"
          />
          <LinkRow
            icon={Mail02Icon}
            label="Contact Support"
            href="mailto:support@billbolt.atlabx.com"
          />
          <LinkRow
            icon={File02Icon}
            label="Terms of Service"
            href="https://billbolt.atlabx.com/terms"
          />
          <LinkRow
            icon={SecurityCheckIcon}
            label="Privacy Policy"
            href="https://billbolt.atlabx.com/privacy"
          />
        </View>

        {/* Identity & Company Attribution (Meta-style) */}
        <View className="items-center mt-10 mb-2">
          <Text className="text-2xs font-inter-medium text-bolt-slate uppercase tracking-widest mb-1.5">
            from
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://atlabx.com").catch(() => { })}
            className="flex-row items-center gap-2 bg-bolt-card px-4 py-2 rounded-2xl border border-bolt-border shadow-sm active:scale-98"
            activeOpacity={0.8}
          >
            <Image
              source={atlabxLogo}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
            />
            <Text className="text-sm font-poppins-bold text-[#0F2A63]">
              AtlabX Technologies
            </Text>
          </TouchableOpacity>
          <Text className="text-center text-2xs font-inter text-bolt-slate mt-3">
            © {new Date().getFullYear()} Billbolt. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
