/**
 * AI Sentiment Analysis Service
 * Basic rule-based implementation — replace with OpenAI/HuggingFace API for production
 */

const POSITIVE_WORDS = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'clean',
  'fresh', 'tasty', 'delicious', 'helpful', 'friendly', 'fast', 'best', 'love',
  'happy', 'satisfied', 'perfect', 'nice', 'awesome',
];

const NEGATIVE_WORDS = [
  'bad', 'terrible', 'awful', 'dirty', 'unhygienic', 'stale', 'rotten', 'slow',
  'rude', 'worst', 'horrible', 'disgusting', 'poor', 'pathetic', 'hate',
  'unhappy', 'disappointed', 'unacceptable', 'filthy', 'cockroach', 'insect',
  'expired', 'overpriced', 'cold', 'complaint',
];

/**
 * Analyze sentiment of text
 * @param {string} text
 * @returns {{ label: string, score: number }}
 */
const analyzeSentiment = async (text) => {
  if (!text) return { label: 'neutral', score: 0 };

  const words = text.toLowerCase().split(/\W+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (POSITIVE_WORDS.includes(word)) positiveCount++;
    if (NEGATIVE_WORDS.includes(word)) negativeCount++;
  });

  const total = positiveCount + negativeCount;
  if (total === 0) return { label: 'neutral', score: 0 };

  const score = (positiveCount - negativeCount) / total;

  let label;
  if (score > 0.2) label = 'positive';
  else if (score < -0.2) label = 'negative';
  else label = 'neutral';

  return { label, score: Math.round(score * 100) / 100 };
};

/**
 * Extract keywords from text (simple frequency-based)
 * @param {string} text
 * @returns {string[]}
 */
const extractKeywords = (text) => {
  if (!text) return [];

  const stopWords = new Set(['the', 'a', 'an', 'is', 'it', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'i', 'we', 'you', 'he', 'she', 'they', 'my', 'our', 'your', 'his', 'her', 'their', 'this', 'that', 'with', 'from', 'by', 'as', 'not', 'no', 'so', 'if', 'then', 'than', 'very', 'just', 'also']);

  const wordFreq = {};
  text.toLowerCase().split(/\W+/).forEach((word) => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

module.exports = { analyzeSentiment, extractKeywords };
