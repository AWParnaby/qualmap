/**
 * NLP processing utilities for extracting meaningful phrases from text
 * Uses Compromise NLP library for phrase extraction and linguistic analysis
 */
import nlp from 'compromise';

// Common English words to exclude from phrase extraction
const COMMON_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
  'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
  'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
  'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
  'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us'
];

/**
 * Extract meaningful phrases from a single text using NLP patterns
 *
 * @param {string} text - Text to analyze
 * @returns {string[]} Array of extracted phrases
 */
export function extractPhrases(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const doc = nlp(text);

  // Extract meaningful phrases using NLP patterns
  const phrases = [
    // Noun phrases (e.g., "digital skills", "community support")
    ...doc.match('#Adjective+ #Noun+').out('array'),
    // Verb phrases (e.g., "providing support", "accessing services")
    ...doc.match('#Verb #Noun+').out('array'),
    // Organization names (e.g., "Citizens Advice", "Job Centre")
    ...doc.organizations().out('array'),
    // Topics (automatically detected subjects)
    ...doc.topics().out('array')
  ];

  // Return unique phrases, normalized to lowercase
  return [...new Set(phrases.map(p => p.toLowerCase()))];
}

/**
 * Determines if a phrase is significant enough to include
 * Filters out common words and validates grammatical structure
 *
 * @param {string} phrase - The phrase to evaluate
 * @returns {boolean} True if the phrase should be included
 */
export function isSignificantPhrase(phrase) {
  if (!phrase || typeof phrase !== 'string') {
    return false;
  }

  const normalized = phrase.toLowerCase().trim();

  // Filter out common words
  if (COMMON_WORDS.includes(normalized)) {
    return false;
  }

  const doc = nlp(normalized);

  // A phrase is considered significant if it has valid grammatical structure
  return (
    doc.match('#Adjective+ #Noun+').found ||  // Valid noun phrase
    doc.match('#Verb #Noun+').found ||        // Valid verb phrase
    doc.organizations().found ||              // Organization name
    doc.topics().found                        // Recognized topic
  );
}

/**
 * Count phrase frequencies across multiple texts
 * Multi-word phrases are weighted 2x to emphasize meaningful combinations
 *
 * @param {string[]} texts - Array of texts to analyze
 * @returns {Object.<string, number>} Object mapping phrases to their counts
 */
export function countPhraseFrequencies(texts) {
  if (!Array.isArray(texts)) {
    return {};
  }

  const phraseCount = {};

  texts.forEach(text => {
    if (!text) return;

    const phrases = extractPhrases(text);

    phrases.forEach(phrase => {
      if (isSignificantPhrase(phrase)) {
        // Weight multi-word phrases more heavily
        const weight = phrase.includes(' ') ? 2 : 1;
        phraseCount[phrase] = (phraseCount[phrase] || 0) + weight;
      }
    });
  });

  return phraseCount;
}

/**
 * Generate word cloud data from phrase frequencies
 * Returns top N phrases sorted by frequency
 *
 * @param {Object.<string, number>} phraseCount - Phrase frequency map
 * @param {number} limit - Maximum number of phrases to return (default: 50)
 * @returns {Array<{value: string, count: number}>} Sorted array of phrases with counts
 */
export function generateWordCloudData(phraseCount, limit = 50) {
  if (!phraseCount || typeof phraseCount !== 'object') {
    return [];
  }

  return Object.entries(phraseCount)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Complete pipeline: extract phrases from texts and generate word cloud data
 *
 * @param {string[]} texts - Array of texts to analyze
 * @param {number} limit - Maximum number of phrases to return (default: 50)
 * @returns {Array<{value: string, count: number}>} Word cloud data
 */
export function processTextsToWordCloud(texts, limit = 50) {
  const frequencies = countPhraseFrequencies(texts);
  return generateWordCloudData(frequencies, limit);
}
