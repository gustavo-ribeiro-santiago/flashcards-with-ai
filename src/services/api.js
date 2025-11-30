import axios from 'axios';

const GENERATE_FLASHCARDS_URL = process.env.REACT_APP_GENERATE_FLASHCARDS_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://your-region-your-project.cloudfunctions.net'
    : 'http://localhost:8000'
);

const SAVE_PERFORMANCE_URL = process.env.REACT_APP_SAVE_PERFORMANCE_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://your-region-your-project.cloudfunctions.net'
    : 'http://localhost:8000'
);

// Create axios instances for each service
const apiGenerate = axios.create({
  baseURL: GENERATE_FLASHCARDS_URL,
  timeout: 240000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiSave = axios.create({
  baseURL: SAVE_PERFORMANCE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
[apiGenerate, apiSave].forEach(apiInstance => {
  apiInstance.interceptors.request.use(
    (config) => {
      // Add any auth headers here if needed
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );
});

export const apiService = {
  // Generate flashcards using AI
  generateFlashcards: async (theme, numCards, language, userId) => {
    try {
      const response = await apiGenerate.post('/', {
        theme,
        num_cards: numCards,
        language,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  },

  // Save performance data
  savePerformance: async (performanceData) => {
    try {
      const response = await apiSave.post('/save_performance', performanceData);
      return response.data;
    } catch (error) {
      console.error('Error saving performance:', error);
      throw error;
    }
  }
};

export default {
  generate: apiGenerate,
  save: apiSave
};
