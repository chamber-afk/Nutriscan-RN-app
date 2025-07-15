import { Text, View, Image, ScrollView } from 'react-native'
import React from 'react'

// Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../App'
import BackButton from '../components/BackButton'

type NutrientScreenProps = NativeStackScreenProps<RootStackParamList, 'Nutrients'>

export default function NutrientsScreen({ navigation, route }: NutrientScreenProps) {
  const { displayData } = route.params;
  const foodLabel = displayData[0];
  const nutrients = displayData[1];
  const imagePath = displayData[2];

  const getEssentialNutrients = (nutrients) => {
    const essentialNames = [
      'Protein',
      'Total lipid (fat)',
      'Carbohydrate, by difference',
      'Total Sugars',
      'Vitamin B-6',
      'Fiber, total dietary',
      'Sodium, Na',
      'Calcium, Ca',
      'Iron, Fe',
      'Vitamin C, total ascorbic acid'
    ];

    return nutrients.filter(nutrient =>
      essentialNames.includes(nutrient.name) &&
      nutrient.amount !== undefined &&
      nutrient.amount !== null 
    );
  };

  return (
    <View className="flex-1 bg-[#021526]">
      {/* Back button */}
      <BackButton onPress={() => navigation.goBack()} />

      {/* Upper Half - Food Logo and Title */}
      <View className="items-center pt-32">
        <Image
          source={imagePath ? { uri: imagePath } : require('../../assets/logo.png')}
          style={{ width: 120, height: 120 }}
          resizeMode="cover"
          className='rounded-full'
        />
        <Text className="text-white text-2xl font-bold mt-4">{foodLabel}</Text>
      </View>



      {/* Nutrients Section */}
      <ScrollView
        className="mt-8 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[#83B4FF] text-lg font-semibold mb-4">Nutrients</Text>

        {getEssentialNutrients(nutrients).map((nutrient, index) => (
          <View key={index} className="bg-white/10 p-4 rounded-xl mb-4">
            <Text className="text-white font-semibold">{nutrient.name}</Text>
            <Text className="text-[#83B4FF] pt-2">
              {nutrient.amount} {nutrient.unit}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

}
