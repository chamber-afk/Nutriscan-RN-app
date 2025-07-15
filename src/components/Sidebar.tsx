import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import SimpleDatabase, { Chat } from '../database/SimpleDatabase';
import Icon from 'react-native-vector-icons/FontAwesome';

interface SidebarProps {
    visible: boolean;
    onClose: () => void;
    onChatSelect: (chatId: string) => void;
    onNewChat: () => void;
    currentChatId: string;
}

export default function Sidebar({ visible, onClose, onChatSelect, onNewChat, currentChatId }: SidebarProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (visible) {
            loadChats();
        }
    }, [visible]);

    const loadChats = async () => {
        setLoading(true);
        try {
            const recentChats = await SimpleDatabase.getRecentChats(5);
            setChats(recentChats);
        } catch (error) {
            console.error('Failed to load chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChat = (chatId: string) => {
        Alert.alert(
            'Delete Chat',
            'Are you sure you want to delete this chat?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await SimpleDatabase.deleteChat(chatId);
                            loadChats();
                            if (chatId === currentChatId) {
                                onNewChat();
                            }
                        } catch (error) {
                            console.error('Failed to delete chat:', error);
                        }
                    }
                }
            ]
        );
    };


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 flex-row">
                {/* Sidebar */}
                <View className="w-80 bg-gray-800 h-full">
                    {/* Header */}
                    <View className="bg-gray-900 p-4 border-b border-gray-700">
                        <View className="flex-row justify-between items-center pt-16">
                            <Text className="text-white text-lg font-bold">Chat History</Text>
                            <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Chat Button */}
                    <TouchableOpacity
                        onPress={() => {
                            onNewChat();
                            onClose();
                        }}
                        className="m-4 bg-blue-600 p-3 rounded-lg"
                    >
                        <Text className="text-white text-center font-medium">+ New Chat</Text>
                    </TouchableOpacity>

                    {/* Chat List */}
                    <ScrollView className="flex-1 px-4">
                        {loading ? (
                            <Text className="text-gray-400 text-center mt-8">Loading...</Text>
                        ) : chats.length === 0 ? (
                            <Text className="text-gray-400 text-center mt-8">No chats yet</Text>
                        ) : (
                            chats.map((chat) => (
                                <View key={chat.id} className="mb-4">
                                    <TouchableOpacity
                                        onPress={() => {
                                            onChatSelect(chat.id);
                                            onClose();
                                        }}
                                        className={`p-3 rounded-lg ${chat.id === currentChatId ? 'bg-blue-600' : 'bg-gray-700'
                                            }`}
                                    >
                                        <Text className="text-white font-medium" numberOfLines={1}>
                                            {chat.title}
                                        </Text>
                                        <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
                                            {chat.lastMessage}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteChat(chat.id)}
                                            className="absolute top-2 right-2 p-1"
                                        >
                                            <Icon name="trash" size={16} color="#f87171" />  
                                        </TouchableOpacity>
                                    </TouchableOpacity>

                                    {/* Delete Button */}

                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* Overlay */}
                <TouchableOpacity
                    className="flex-1 bg-black bg-opacity-50"
                    onPress={onClose}
                />
            </View>
        </Modal>
    );
}