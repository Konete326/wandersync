import openai, { isOpenAiConfigured } from '../config/openai.js';
import UserPreference from '../models/UserPreference.js';

export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const generateEmbedding = async (text) => {
  if (!text || typeof text !== 'string') return new Array(64).fill(0);

  if (isOpenAiConfigured()) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.trim().slice(0, 1000)
      });
      if (response?.data?.[0]?.embedding) {
        return response.data[0].embedding;
      }
    } catch (err) {
      console.warn('OpenAI Embedding API call fallback to heuristic vector:', err.message);
    }
  }

  const vector = new Array(64).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  words.forEach((word, idx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const pos = Math.abs(hash) % 64;
    vector[pos] += 1 / (idx + 1);
  });

  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return norm === 0 ? vector : vector.map(val => val / norm);
};

export const saveUserPreferenceEmbedding = async (userId, queryText, category = 'trip_query', metadata = {}) => {
  try {
    if (!userId || !queryText) return null;
    const embedding = await generateEmbedding(queryText);
    const pref = await UserPreference.create({
      user: userId,
      queryText,
      category,
      embedding,
      metadata
    });
    return pref;
  } catch (err) {
    console.error('Error saving user preference embedding:', err.message);
    return null;
  }
};

export const getPersonalizedContext = async (userId, currentDestination, currentInterests = '') => {
  try {
    if (!userId) return null;
    const preferences = await UserPreference.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean();
    if (!preferences || preferences.length === 0) return null;

    const currentQuery = `${currentDestination} ${currentInterests}`;
    const currentVector = await generateEmbedding(currentQuery);

    const scoredPrefs = preferences.map(pref => ({
      ...pref,
      similarity: cosineSimilarity(currentVector, pref.embedding || [])
    })).sort((a, b) => b.similarity - a.similarity);

    const topMatches = scoredPrefs.slice(0, 3).filter(p => p.similarity > 0.1);
    if (topMatches.length === 0) return null;

    return {
      topInterests: Array.from(new Set(topMatches.map(m => m.queryText))).slice(0, 4),
      matchingTravelStyles: topMatches.map(m => m.metadata?.travelStyle).filter(Boolean),
      embeddingScore: topMatches[0].similarity.toFixed(3)
    };
  } catch (err) {
    console.error('Error computing personalized embedding context:', err.message);
    return null;
  }
};
