export async function fetchNutritionFromLabel(label: string, apiKeys: { food: string }) {
  try {
    const FOOD_API_URL = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKeys.food}`;
    const NUTRIENT_API_URL = `https://api.nal.usda.gov/fdc/v1/food/`;

    const searchResponse = await fetch(`${FOOD_API_URL}&query=${label}`);
    if (!searchResponse.ok) {
      return {
        success: false,
        error: 'SEARCH_API_ERROR',
        message: 'Unable to search for nutrition data. Please try again.',
      };
    }

    const searchJson = await searchResponse.json();
    const firstResult = searchJson.foods?.[0];

    if (!firstResult) {
      return {
        success: false,
        error: 'FOOD_NOT_FOUND',
        message: `Does not seem like food!, No nutrition data found for "${label}". Try taking a new photo.`,
      }
    }

    const fdcId = firstResult.fdcId;

    const finalResponse = await fetch(`${NUTRIENT_API_URL}${fdcId}?api_key=${apiKeys.food}`);

    if (!finalResponse.ok) {
      return {
        success: false,
        error: 'NUTRIENT_API_ERROR',
        message: 'Unable to get nutrition details. Please try again.',
      };
    }
    const finalJson = await finalResponse.json();

    if (!finalJson.foodNutrients || finalJson.foodNutrients.length === 0) {
      return {
        success: false,
        error: 'NO_NUTRITION_DATA',
        message: `No nutrition information available for "${label}".`,
      };
    }

    return {
      success: true,
      description: finalJson.description,
      nutrients: finalJson.foodNutrients.map((n: any) => ({
        name: n.nutrient?.name || n.name,
        amount: n.amount,
        unit: n.nutrient?.unitName || n.unitName,
      })),
    };
  }catch (error) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Network error while fetching nutrition data. Please check your connection.',
    };
  }
  }
