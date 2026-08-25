import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey && apiKey.trim().length > 10 ? new GoogleGenerativeAI(apiKey) : null;

export const AVAILABLE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-2.5-flash-lite'
];

export const isGeminiConfigured = () => Boolean(genAI);

export const getGeminiModel = (modelName = 'gemini-3.6-flash', isJson = true) => {
  if (!genAI) {
    return null;
  }
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: isJson ? { responseMimeType: 'application/json' } : undefined
  });
};

export default genAI;
