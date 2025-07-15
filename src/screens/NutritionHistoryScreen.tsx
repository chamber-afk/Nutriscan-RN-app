import { Alert, Text, TouchableOpacity, View, FlatList, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RootStackParamList } from '../../App'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

import BackButton from '../components/BackButton'
import { deleteNutritionEntry, getNutritionData, NutritionEntry } from '../utils/nutritionStorage'

type NutritionHistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'History'>

export default function NutritionHistoryScreen({ navigation }: NutritionHistoryScreenProps) {

  const [nutritionData, setNutritionData] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getNutritionData();
      setNutritionData(data);
    } catch (error) {
      console.log('Failed loading the history!', { error });
      Alert.alert('Failed loading the history!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData()
  },[]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (item: NutritionEntry) => {
    navigation.navigate('Nutrients', {
      displayData: [item.foodlabel, item.nutrients, item.imagePath]
    });
  }

  const handleDeleteEntry = async (id: string, foodlabel: string) => {
    Alert.alert (
      'Delete Entry',
      `Are you sure you want to delete this entry "${foodlabel}" ?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try{
              await deleteNutritionEntry(id);
              loadData();
            }catch (error) {
              Alert.alert('Error', 'Failed to delete entry!');
            }
          }
        }
      ]
    )
  }

  const renderNutritionItem = ({ item }: { item: NutritionEntry }) => (
    <TouchableOpacity
      className='bg-white/10 p-4 rounded-xl mb-4 mx-6'
      onPress={() => handleViewDetails(item)}
    >
      <View className='flex-row items-center'>
        <Image 
          source={item.imagePath ? { uri: item.imagePath } : require('../../assets/logo.png')}
          style={{width: 60, height: 60}}
          resizeMode='cover'
          className='rounded-full'
        />
        <View className="flex-1 ml-4">
          <Text className="text-white font-semibold text-lg">{item.foodlabel}</Text>
          <Text className="text-gray-300 text-sm mt-1">{formatDate(item.savedAt)}</Text>
          <Text className="text-[#83B4FF] text-sm mt-1">
            {item.nutrients.length} Nutrients recorded
          </Text>
        </View>
        {/* Delete Button */}
        <TouchableOpacity
          className="bg-red-500/20 px-3 py-2 rounded-lg"
          onPress={() => handleDeleteEntry(item.id, item.foodlabel)}
        >
          <Text className="text-red-400 font-medium text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <View className='flex-1 bg-[#021526]'>
      {/* Back Button */}
      <View className='flex-row items-center justify-between px-6 pt-12 pb-6'>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      {/* Header */}
      <View className='items-center justify-between px-6 pt-12 pb-6'>
        <Text className='text-white text-2xl font-bold'>Nutrition History</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-white text-lg'>Loading...</Text>
        </View>
      ) :
        nutritionData.length == 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-gray-400 text-lg text-center">No nutrition data saved yet</Text>
            <Text className="text-gray-500 text-center mt-2">
              Take a photo of food to start tracking nutrition
            </Text>
            <TouchableOpacity
              className="bg-[#03346E] px-6 py-3 rounded-xl mt-6"
              onPress={() => navigation.navigate('Home')}
            >
              <Text className="text-white font-semibold">Start Tracking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={nutritionData}
            renderItem={renderNutritionItem}
            keyExtractor={(item) => item.id.toString()}
          />
      )
      }
    </View>
  )
}
