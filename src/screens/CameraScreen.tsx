import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import React, { useRef, useState } from 'react';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

import LoadingOverlay from '../components/LoadingOverlay';
import BackButton from '../components/BackButton';
import { analyzeFoodFromPhoto } from '../utils/foodAnalysis';
import { API_KEYS } from '../config';

import { saveNutritionEntry } from '../utils/nutritionStorage';

type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const [uploading, setUploading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const CLOUD_VISION_API_KEY = API_KEYS.VISION;
  const NUTRIENT_API_KEY = API_KEYS.USDA;
  

  const handleSaveNutritionData = async () => {
    try {
      setIsSaved(true);
      Alert.alert('Success', 'Entry saved to history!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save nutrition data');
    }
  };

  const takePicture = async () => {
    if (!camera.current) return;

    setUploading(true);
    try {
      const photo = await camera.current.takePhoto();


      const result = await analyzeFoodFromPhoto(photo.path, {
        vision: CLOUD_VISION_API_KEY,
        food: NUTRIENT_API_KEY
      });

      if(result.success == false){
        Alert.alert(
          'Detection Failed',
          result.message,
          [
            { text: 'Try Again', onPress: () => {navigation.navigate('Camera')} },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }
      const data: [string, any, string] = [result.description, result.nutrients, result.imageUrl];

      await saveNutritionEntry(data);
      await handleSaveNutritionData();
      setTimeout(() => {
        navigation.navigate('Nutrients', { displayData: data });
      }, 1000);

      console.log('Food:', result.description);
      console.log('Nutrients:', result.nutrients);
      
    } catch (err) {
      Alert.alert('Error', `Failed to analyze image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }
  };

  if (!device) return <Text style={styles.errorText}>Camera not available</Text>;

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      <BackButton onPress={() => navigation.goBack()} />

      <TouchableOpacity
        onPress={takePicture}
        disabled={uploading}
        style={[styles.captureButton, { backgroundColor: '#FF0037' }]}
      />

      {uploading && <LoadingOverlay />}

      {isSaved && (
        <View style={styles.saveIndicator}>
          <View style={styles.saveDot} />
          <Text style={styles.saveText}>Saved to history</Text>
        </View>
      )}
    </View>
  );
}

// Keep all your existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  saveIndicator: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveDot: {
    width: 8,
    height: 8,
    backgroundColor: 'green',
    borderRadius: 4,
    marginRight: 6,
  },
  saveText: {
    color: 'green',
    fontSize: 14,
  },
});

//gemini
//AIzaSyCX2KWqmxAewgfRjHCgPDgWnYUWIZaXBUY