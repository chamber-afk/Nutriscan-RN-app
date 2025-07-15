import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API } from '../config';

import BackButton from '../components/BackButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type BotScreenProps = NativeStackScreenProps<RootStackParamList, 'Bot'>;

export default function BotScreen({navigation} : BotScreenProps) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Create a ref for the FlatList
  const flatListRef = useRef(null);

  const apikey = GEMINI_API.geminiapi;
  const ai = new GoogleGenAI({ apiKey: apikey });

  // Define your system instructions
  const systemInstruction = `You are a helpful and friendly AI assistant. 
  Please follow these guidelines:
  - Keep responses concise and helpful
  - Act as a healthy food advisor and nutrition analyzer
  - Use a conversational tone
  - If you're unsure about something, say so
  - Focus on providing accurate information
  - Be respectful and professional`;

  // Function to scroll to the end of the FlatList
  const scrollToEnd = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const startChat = async () => {
    if (!userInput.trim()) return;

    const userMessage = { role: 'user', text: userInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Small delay to ensure the message is rendered before scrolling
    setTimeout(() => scrollToEnd(), 1);
    
    setUserInput('');
    setLoading(true);

    try {
      // Convert messages to Gemini format
      const contents = updatedMessages.map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config : {
          systemInstruction: systemInstruction,
          maxOutputTokens: 500,
          temperature: 0.4, 
          topP: 0.8, 
          topK: 20, 
        } , 
      });

      const text = await response.text; // extract AI response
      const botMessage = { role: 'bot', text };
      setMessages(prev => [...prev, botMessage]);
      
      // Small delay to ensure the message is rendered before scrolling
      setTimeout(() => scrollToEnd(), 100);
    } catch (error) {
      console.error('Error generating content:', error);
      // Add error message to chat
      const errorMessage = { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View
      className={`my-2 px-4 py-3 rounded-2xl max-w-[85%] shadow-sm ${item.role === 'user'
        ? 'bg-blue-600 self-end'
        : 'bg-gray-700 self-start border border-gray-600'
        }`}
    >
      <Text className="text-white text-base leading-relaxed">{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-gray-800 py-4 px-5 items-center border-b border-gray-700 shadow-lg">
        <Text className="text-white text-xl font-bold">ChatBot</Text>
      </View>

      <BackButton onPress={() => navigation.goBack()} />

      {/* Messages */}
      <FlatList
        ref={flatListRef} // Add the ref here
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View className="flex-row items-center px-4 py-3 bg-gray-800 border-t border-gray-700 pb-8">
          <TextInput
            className="flex-1 text-white bg-gray-700 rounded-full px-5 py-3 mr-3 border border-gray-600 text-base"
            placeholder="Type your message..."
            placeholderTextColor="#9ca3af"
            value={userInput}
            onChangeText={setUserInput}
            onSubmitEditing={startChat}
            editable={!loading}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={startChat}
            disabled={loading}
            className={`rounded-full px-6 py-3 shadow-md ${loading ? 'bg-gray-500' : 'bg-blue-600 active:bg-blue-700'
              }`}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? '...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}