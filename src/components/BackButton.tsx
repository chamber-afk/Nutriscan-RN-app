// components/BackButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
interface Props {
  onPress: () => void;
}

export default function BackButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Icon name="arrow-left" size={22} color="#000" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(99, 184, 241, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});
