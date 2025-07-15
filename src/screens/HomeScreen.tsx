import { Text, View, Image, TouchableOpacity, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../App'

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);



  const onPhotoClickButton = () => {
    navigation.navigate('Camera')
  }

  const onHistoryClickButton = () => {
    navigation.navigate('History');
  }

  const onBotClick = () => {
    navigation.navigate('Bot');
  }

  return (
    <View className="flex-1 bg-[#021526]">
      {/* Header Section */}
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        className="px-6 mt-20"
      >
        <View className="flex-row pt-12">
          <Text className="text-5xl font-black text-white">
            NUTRI
          </Text>
          <Text className="text-5xl font-black text-[#83B4FF]">
            SCAN.
          </Text>
        </View>
        <Text className="text-3xl font-black text-gray-400 mt-2">
          Smart nutrition
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          "Scan, analyze, improve"
        </Text>
      </Animated.View>

      {/* Logo Section */}
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        className="items-center mt-8 pt-8"
      >
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 150, height: 150 }}
        />
      </Animated.View>

      {/* Buttons Section */}
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        className="flex-1 items-center justify-center px-6 mt-12"
      >
        <View className="w-full max-w-sm space-y-4">
          
          {/* Ask NutriAI Button */}
          <TouchableOpacity
            className="w-full h-16 bg-gradient-to-r from-[#03346E] to-[#0E4B99] rounded-2xl justify-center items-center shadow-lg border border-[#83B4FF]/20 mb-4"
            onPress={onBotClick}
            style={{
              shadowColor: '#83B4FF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white text-lg font-bold">Ask NutriAI</Text>
          </TouchableOpacity>

          {/* View History Button */}
          <TouchableOpacity
            className="w-full h-16 bg-[#03346E] rounded-2xl justify-center items-center shadow-md border border-[#83B4FF]/10 mb-4"
            onPress={onHistoryClickButton}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text className="text-white text-lg font-semibold">Nutrition History</Text>
          </TouchableOpacity>

          {/* Click Photo Button */}
          <TouchableOpacity
            className="w-full h-16 bg-[#03346E] rounded-2xl justify-center items-center shadow-md border border-[#83B4FF]/10"
            onPress={onPhotoClickButton}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text className="text-white text-lg font-semibold">Scan Food</Text>
          </TouchableOpacity>

        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.View 
        style={{
          opacity: fadeAnim,
        }}
        className="items-center pb-8"
      >
        <Text className="text-gray-500 text-xs">
          Choose any option above
        </Text>
      </Animated.View>
    </View>
  )
}