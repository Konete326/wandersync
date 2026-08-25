import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY || '';

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

export const isOpenAiConfigured = () => Boolean(apiKey && apiKey.trim().length > 10);

const openai = isOpenAiConfigured() ? new OpenAI({ apiKey }) : null;

export default openai;
