import { View, Text, Image } from 'react-native'
import React from 'react'
import logo from "@/assets/images/icon.png"

export default function AuthHeader({title, label}:{title: string, label: string}) {
  return (
     <View className="w-full flex gap-2">
            <View className="flex justify-center items-center ">
              <Image
                source={logo}
                className="w-20 h-20 rounded-2xl"
                resizeMode="contain"
              />
            </View>
            <View className="w-[90%] flex items-center justify-center gap-1 m-auto px-6 ">
              <Text className="text-3xl font-poppins-bold text-center ">
                {title}
              </Text>
              <Text className="text-bolt-slate font-poppins-medium text-center">
               {label}
              </Text>
            </View>
          </View>

  )
}