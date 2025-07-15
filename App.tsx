import React from 'react'
import CameraScreen from './src/screens/CameraScreen'
import "./global.css"
import HomeScreen from './src/screens/HomeScreen'

//Navigation
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack' 
import NutrientsScreen from './src/screens/NutrientsScreen'
import NutritionHistoryScreen from './src/screens/NutritionHistoryScreen'
import BotScreen from './src/screens/BotScreen'


const Stack = createNativeStackNavigator<RootStackParamList>()
type DisplayDataType = [string, any, string];
  
export type RootStackParamList = {
  Home: undefined;
  Camera : undefined
  Nutrients: { displayData: DisplayDataType };
  History: undefined
  Bot: undefined
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator id={undefined} initialRouteName='Home' screenOptions={{headerShown: false}}>
        <Stack.Screen name='Camera' component={CameraScreen}></Stack.Screen>
        <Stack.Screen name='Home' component={HomeScreen}></Stack.Screen>
        <Stack.Screen name='Nutrients' component={NutrientsScreen}></Stack.Screen>
        <Stack.Screen name='History' component={NutritionHistoryScreen}></Stack.Screen>
        <Stack.Screen name='Bot' component={BotScreen}></Stack.Screen>
      </Stack.Navigator>

    </NavigationContainer>
  )
}
