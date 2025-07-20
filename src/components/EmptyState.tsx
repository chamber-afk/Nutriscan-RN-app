import React from 'react';
import { View, Text, Animated } from 'react-native';

interface EmptyStateProps {
  fadeAnim: Animated.Value;
}

const EmptyState: React.FC<EmptyStateProps> = ({ fadeAnim }) => (
  <Animated.View 
    style={{ opacity: fadeAnim }}
    className="flex-1 justify-center items-center px-8"
  >
    <View className="items-center">
      <View className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <Text className="text-white text-3xl">🥗</Text>
      </View>
      <Text className="text-white text-2xl font-bold mb-3 text-center">
        Welcome to NutriAI
      </Text>
      <Text className="text-gray-400 text-center leading-relaxed mb-6">
        Your personal nutrition assistant is here to help! Ask me about food nutrition, healthy recipes, or diet advice.
      </Text>
      <View className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
        <Text className="text-gray-300 text-sm text-center">
          💡 Try asking: "What are the benefits of eating spinach?" or "Suggest a healthy breakfast"
        </Text>
      </View>
    </View>
  </Animated.View>
);

export default EmptyState;