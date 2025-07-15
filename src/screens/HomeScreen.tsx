import { Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../App'

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ navigation }: HomeScreenProps) {

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
      <View className="items-center mt-80">
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 192, height: 192, marginBottom: 8 }}
        />
        <Text className="text-2xl font-bold text-[#83B4FF]">Welcome to Nutriscan</Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="w-80 items-center justify-center mt-20">
        <TouchableOpacity
            className="w-11/12 max-w-md h-14 bg-[#03346E] rounded-xl justify-center items-center shadow-md mt-4"
            onPress={onBotClick}
          >
            <Text className="text-white text-lg font-semibold">Ask Bot</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-11/12 max-w-md h-14 bg-[#03346E] rounded-xl justify-center items-center shadow-md mt-4"
            onPress={onHistoryClickButton}
          >
            <Text className="text-white text-lg font-semibold">View Nutrition History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-11/12 max-w-md h-14 bg-[#03346E] rounded-xl justify-center items-center shadow-md mt-4"
            onPress={onPhotoClickButton}
          >
            <Text className="text-white text-lg font-semibold">Click Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}