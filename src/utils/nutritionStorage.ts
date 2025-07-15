import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NutritionEntry{
    id: string,
    foodlabel: string,
    nutrients: Array<{
        name: string;
        amount: string | number;
        unit: string;
      }>;
      imagePath: string;
      savedAt: string;
}

const STORAGE_KEY = 'nutrition_history';

export const saveNutritionEntry = async (data: [string, any, string]) => {
    try {
        console.log('Saving new entry');

        const existingDataString = await AsyncStorage.getItem(STORAGE_KEY);
        let exisitngData: NutritionEntry[] = [];

        if(existingDataString){
            exisitngData = JSON.parse(existingDataString);
            console.log('Existing data length: ',exisitngData.length);
        }

        const newEntry: NutritionEntry = {
            id: Date.now().toString(),
            foodlabel: data[0],
            nutrients: data[1],
            imagePath: data[2],
            savedAt: new Date().toDateString()
        };

        exisitngData.unshift(newEntry);

        await AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(exisitngData));

        console.log('Successfully added new nutrient');
        return newEntry;
    }catch(error){
        console.log('Error saving nutrition entry:', error);
        throw error;
    }
};

export const getNutritionData = async () => {
    try{
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }catch (error){
        console.error('Error getting nutrition history:', error);
        return [];
    }
}

export const deleteNutritionEntry = async (id: string) => {
    try {
        console.log('Deleting nutrition entry with ID:', id);
        
        // Get existing data
        const existingData = await getNutritionData();
        
        // Filter out the entry with matching ID
        const updatedData = existingData.filter((entry: NutritionEntry) => entry.id !== id);
        
        // Save updated data back
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        
        console.log('Successfully deleted nutrition entry!');
        
      } catch (error) {
        console.log('Error deleting nutrition entry:', error);
        throw error;
      }
};