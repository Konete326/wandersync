import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const AVAILABLE_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite'
];

export const getGeminiModel = (modelName = 'gemini-3.7-flash', isJson = true) => {
  if (!genAI) {
    return null;
  }
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: isJson ? { responseMimeType: 'application/json' } : undefined
  });
};

export default genAI;
