import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  if (!genAI) {
    return null;
  }
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });
};

export default genAI;
