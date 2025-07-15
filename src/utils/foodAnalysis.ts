// utils/foodAnalysis.ts
import { uploadImageToCloudinary } from './cloudinary';
import { CLOUDINARY_CONFIG } from '../config';

interface ApiKeys {
  vision: string;
  food: string;
}

export async function analyzeFoodFromPhoto(filePath: string, apiKeys: ApiKeys) {
  try {
    const uploadResult = await uploadImageToCloudinary(filePath, CLOUDINARY_CONFIG);
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKeys.vision}`;

    const requestBody = {
      requests: [
        {
          image: { 
            source: { imageUri: uploadResult.secure_url } 
          },
          features: [{ type: 'LABEL_DETECTION', maxResults: 5 }],
        },
      ],
    };

    const response = await fetch(visionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'VISION_API_ERROR',
        message: 'Unable to analyze the image. Please try again.',
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
      };
    }

    const json = await response.json();
    const labels = json.responses?.[0]?.labelAnnotations || [];
    
    if (labels.length === 0) {
      return {
        success: false,
        error: 'NO_LABELS_DETECTED',
        message: 'No food items detected in the image. Please try taking another photo.',
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
      };
    }

    console.log('Labels detected:', labels);
    
    // Sort by confidence (topicality)
    labels.sort((a: { topicality: number }, b: { topicality: number }) => b.topicality - a.topicality);
    const bestLabel = labels[0]?.description;

    if (!bestLabel) {
      throw new Error("No valid label detected");
    }

    console.log('Best label detected:', bestLabel);

    console.log('Fetching nutrition data...');
    const { fetchNutritionFromLabel } = await import('./nutrition');
    
    const nutritionData = await fetchNutritionFromLabel(bestLabel, {
      food: apiKeys.food,
    });

    if (!nutritionData.success) {
      return {
        success: false,
        error: 'NUTRITION_DATA_ERROR',
        message: nutritionData.message,
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
      };
    }

    return {
      success : true,
      description: bestLabel, 
      nutrients: nutritionData.nutrients, 
      confidence: labels[0]?.topicality || 0,
      imageUrl: uploadResult.secure_url, 
      imagePublicId: uploadResult.public_id,
      allLabels: labels.map(l => ({ name: l.description, confidence: l.topicality })),
    };

  } catch (error) {
    console.error('Food analysis error:', error);
    return {
      success: false,
      error: 'ANALYSIS_FAILED',
      message: 'Failed to analyze the image. Please try again.',
      originalError: error.message,
    }
  }
}