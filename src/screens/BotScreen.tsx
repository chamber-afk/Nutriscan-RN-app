import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Alert, Animated, Dimensions } from 'react-native';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API } from '../config';
import SimpleDatabase, { Message } from '../database/SimpleDatabase';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import EmptyState from '../components/EmptyState';

type BotScreenProps = NativeStackScreenProps<RootStackParamList, 'Bot'>;

export default function BotScreen({ navigation }: BotScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const apikey = GEMINI_API.geminiapi;
  const ai = new GoogleGenAI({ apiKey: apikey });

  const systemInstruction = `You are a smart, friendly AI nutrition assistant in a food analysis app. 
    Your job is to provide helpful, easy-to-understand nutritional insights.
    Guidelines:
    - Always speak as a food and nutrition advisor.
    - Keep responses concise, warm, and conversational.
    - Focus on nutritional value, health benefits, or concerns related to the food.
    - Suggest healthier alternatives or portion advice when appropriate.
    - Always be respectful, non-judgmental, and supportive of healthy eating habits.
    `;

  // Initialize database and create new chat
  useEffect(() => {
    initializeApp();
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onBackPress = () => {
    navigation.goBack();
  }

  const initializeApp = async () => {
    try {
      await SimpleDatabase.init();
      setDbReady(true);
      startNewChat();
    } catch (error) {
      console.error('App initialization failed:', error);
      Alert.alert('Error', 'Failed to initialize app');
    }
  };

  const startNewChat = () => {
    const newChatId = SimpleDatabase.generateChatId();
    setCurrentChatId(newChatId);
    setMessages([]);
    scrollToEnd();
  };

  const loadChat = async (chatId: string) => {
    try {
      const chatMessages = await SimpleDatabase.getMessages(chatId);
      setMessages(chatMessages);
      setCurrentChatId(chatId);
      setTimeout(() => scrollToEnd(), 100);
    } catch (error) {
      console.error('Failed to load chat:', error);
      Alert.alert('Error', 'Failed to load chat');
    }
  };

  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !dbReady) return;

    const userMessage: Message = {
      role: 'user',
      text: userInput,
      chatId: currentChatId
    };

    // Add user message to UI
    setMessages(prev => [...prev, userMessage]);

    // Save user message to database
    await SimpleDatabase.saveMessage('user', userInput, currentChatId);

    setUserInput('');
    setLoading(true);
    scrollToEnd();

    try {
      // Prepare messages for AI
      const allMessages = [...messages, userMessage];
      const contents = allMessages.map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          maxOutputTokens: 500,
          temperature: 0.4,
          topP: 0.8,
          topK: 20,
        },
      });

      const botText = await response.text;
      const botMessage: Message = {
        role: 'bot',
        text: botText,
        chatId: currentChatId
      };

      // Add bot message to UI
      setMessages(prev => [...prev, botMessage]);

      // Save bot message to database
      await SimpleDatabase.saveMessage('bot', botText, currentChatId);

      scrollToEnd();
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        role: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        chatId: currentChatId
      };

      setMessages(prev => [...prev, errorMessage]);
      await SimpleDatabase.saveMessage('bot', errorMessage.text, currentChatId);
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await SimpleDatabase.deleteChat(currentChatId);
              startNewChat();
            } catch (error) {
              console.error('Failed to clear chat:', error);
            }
          }
        }
      ]
    );
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        className={`my-3 px-6 py-4 rounded-3xl max-w-[85%] shadow-lg ${
          item.role === 'user'
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 self-end'
            : 'bg-gradient-to-br from-gray-700 to-gray-800 self-start border border-gray-600'
        }`}
        style={{
          shadowColor: item.role === 'user' ? '#3b82f6' : '#374151',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {item.role === 'bot' && (
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <Text className="text-white text-xs font-bold">AI</Text>
            </View>
            <Text className="text-green-400 text-xs font-semibold">NutriAI Assistant</Text>
          </View>
        )}
        <Text 
          className={`text-base leading-relaxed ${
            item.role === 'user' ? 'text-white' : 'text-gray-100'
          }`}
          style={{ 
            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
            lineHeight: 22 
          }}
        >
          {item.text}
        </Text>
        {item.role === 'user' && (
          <View className="mt-2 flex-row justify-end">
            <Text className="text-blue-200 text-xs">You</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Enhanced Header with Gradient */}
      <View 
        className="py-4 px-5 border-b border-gray-700 flex-row items-center"
        style={{
          backgroundColor: '#1f2937',
          borderBottomWidth: 1,
          borderBottomColor: '#374151',
        }}
      >
        <TouchableOpacity 
          onPress={onBackPress}
          className="mr-4 p-2 rounded-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Icon name="arrow-left" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          className="mr-4 p-2 rounded-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Icon name="bars" size={18} color="#fff" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-white text-xl font-bold">NutriAI</Text>
          <Text className="text-green-400 text-xs">Your Nutrition Assistant</Text>
        </View>

        <View className="flex-row">
          <TouchableOpacity 
            onPress={startNewChat} 
            className="mr-4 p-2 rounded-full"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
            }}
          >
            <Icon name="plus" size={18} color="#22c55e" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={clearCurrentChat}
            className="p-2 rounded-full"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <Icon name="eraser" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages with Enhanced Styling */}
      <View className="flex-1 relative">
        {/* Subtle background pattern */}
        <View 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundColor: 'transparent',
          }}
        />
        
        {messages.length === 0 ? (
          <EmptyState fadeAnim={fadeAnim} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => `${item.chatId}-${index}`}
            contentContainerStyle={{ 
              padding: 16, 
              flexGrow: 1,
              paddingBottom: 20 
            }}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          />
        )}
      </View>

      {/* Enhanced Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View 
          className="flex-row items-end px-4 py-4 border-t border-gray-700"
          style={{
            backgroundColor: '#1f2937',
            borderTopWidth: 1,
            borderTopColor: '#374151',
          }}
        >
          <View className="flex-1 mr-3">
            <TextInput
              className="text-white rounded-3xl px-6 py-4 border text-base"
              style={{
                backgroundColor: '#374151',
                borderColor: '#4b5563',
                borderWidth: 1,
                minHeight: 50,
                maxHeight: 120,
              }}
              placeholder="Ask me about nutrition, recipes, or health tips..."
              placeholderTextColor="#9ca3af"
              value={userInput}
              onChangeText={setUserInput}
              onSubmitEditing={sendMessage}
              editable={!loading && dbReady}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity
            onPress={sendMessage}
            disabled={loading || !dbReady || !userInput.trim()}
            className="rounded-full p-4 shadow-lg"
            style={{
              backgroundColor: loading || !dbReady || !userInput.trim() 
                ? '#4b5563' 
                : '#3b82f6',
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {loading ? (
              <View className="animate-spin">
                <Icon name="spinner" size={20} color="#fff" />
              </View>
            ) : (
              <Icon name="paper-plane" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onChatSelect={loadChat}
        onNewChat={startNewChat}
        currentChatId={currentChatId}
      />
    </SafeAreaView>
  );
}