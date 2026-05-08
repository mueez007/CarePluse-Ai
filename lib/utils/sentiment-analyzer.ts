export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative' | 'stressed';
  score: number; // -1 to 1, negative = bad, positive = good
  confidence: number; // 0-1
  keywords: string[];
  suggestion?: string;
}

export interface EmotionalState {
  mood: 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'stressed';
  energyLevel: 'high' | 'medium' | 'low';
  needsSupport: boolean;
  suggestedAction: string;
}

export class SentimentAnalyzer {
  private positiveWords: Set<string>;
  private negativeWords: Set<string>;
  private stressWords: Set<string>;

  constructor() {
    // Initialize word lists
    this.positiveWords = new Set([
      'good', 'great', 'happy', 'wonderful', 'excellent', 'love', 'enjoy', 
      'blessed', 'grateful', 'peaceful', 'calm', 'relaxed', 'better', 'improved',
      'smile', 'joy', 'excited', 'fantastic', 'amazing', 'beautiful', 'care'
    ]);
    
    this.negativeWords = new Set([
      'bad', 'sad', 'unhappy', 'terrible', 'awful', 'hate', 'dislike', 
      'worse', 'worst', 'pain', 'hurt', 'suffer', 'struggle', 'difficult',
      'tired', 'exhausted', 'lonely', 'alone', 'scared', 'fear', 'worry'
    ]);
    
    this.stressWords = new Set([
      'stressed', 'anxious', 'nervous', 'overwhelmed', 'worried', 'pressure',
      'tense', 'panic', 'scared', 'fear', 'stress', 'anxiety', 'restless'
    ]);
  }

  analyze(text: string): SentimentAnalysis {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    let stressCount = 0;
    const keywords: string[] = [];
    
    // Count sentiment words
    for (const word of words) {
      if (this.positiveWords.has(word)) {
        positiveCount++;
        keywords.push(word);
      }
      if (this.negativeWords.has(word)) {
        negativeCount++;
        keywords.push(word);
      }
      if (this.stressWords.has(word)) {
        stressCount++;
        keywords.push(word);
      }
    }
    
    // Calculate score (-1 to 1)
    const total = positiveCount + negativeCount;
    let score = 0;
    if (total > 0) {
      score = (positiveCount - negativeCount) / total;
    }
    
    // Determine sentiment
    let sentiment: SentimentAnalysis['sentiment'] = 'neutral';
    let confidence = 0.5;
    
    if (stressCount > 0) {
      sentiment = 'stressed';
      confidence = Math.min(0.9, 0.5 + stressCount * 0.1);
    } else if (score > 0.3) {
      sentiment = 'positive';
      confidence = Math.min(0.9, 0.5 + Math.abs(score));
    } else if (score < -0.3) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.5 + Math.abs(score));
    }
    
    // Generate suggestion based on sentiment
    const suggestion = this.generateSuggestion(sentiment, stressCount > 0);
    
    return {
      sentiment,
      score,
      confidence,
      keywords: [...new Set(keywords)].slice(0, 5),
      suggestion
    };
  }

  analyzeEmotionalState(text: string): EmotionalState {
    const analysis = this.analyze(text);
    
    // Determine mood
    let mood: EmotionalState['mood'] = 'neutral';
    let needsSupport = false;
    
    switch (analysis.sentiment) {
      case 'positive':
        mood = analysis.score > 0.6 ? 'happy' : 'calm';
        break;
      case 'negative':
        mood = 'sad';
        needsSupport = true;
        break;
      case 'stressed':
        mood = 'stressed';
        needsSupport = true;
        break;
      default:
        mood = 'neutral';
    }
    
    // Determine energy level based on keywords
    let energyLevel: EmotionalState['energyLevel'] = 'medium';
    if (analysis.keywords.some(k => ['tired', 'exhausted', 'sleepy'].includes(k))) {
      energyLevel = 'low';
    } else if (analysis.keywords.some(k => ['energetic', 'active', 'excited'].includes(k))) {
      energyLevel = 'high';
    }
    
    // Determine suggested action
    let suggestedAction = this.getSuggestedAction(mood, needsSupport);
    
    return {
      mood,
      energyLevel,
      needsSupport,
      suggestedAction
    };
  }

  private generateSuggestion(sentiment: string, isStressed: boolean): string {
    if (isStressed) {
      return "Consider taking a few deep breaths. Would you like to try a relaxation exercise? 🧘";
    }
    
    switch (sentiment) {
      case 'positive':
        return "That's wonderful to hear! Keep focusing on the positive moments in your day. 💙";
      case 'negative':
        return "I'm here to listen. Sometimes talking about how we feel can help. Would you like to share more? 🌸";
      default:
        return "How are you feeling today? I'm always here to listen if you'd like to talk. ��";
    }
  }

  private getSuggestedAction(mood: string, needsSupport: boolean): string {
    const actions: Record<string, string> = {
      happy: "Keep up the positive energy! Try sharing your happiness with a loved one.",
      calm: "Maintain this peaceful state with some light stretching or meditation.",
      neutral: "Take a moment for yourself today. A short walk might help.",
      anxious: "Try the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s.",
      sad: "Reach out to a family member or friend. You don't have to go through this alone.",
      stressed: "Take a 5-minute break. Close your eyes and take slow, deep breaths."
    };
    
    if (needsSupport) {
      return actions[mood] || "Consider talking to someone you trust about how you're feeling.";
    }
    
    return actions[mood] || "Take care of yourself today. Small acts of self-care make a big difference.";
  }

  trackSentimentTrend(history: SentimentAnalysis[]): {
    trend: 'improving' | 'stable' | 'declining';
    averageScore: number;
    recentChange: number;
  } {
    if (history.length < 2) {
      return { trend: 'stable', averageScore: 0, recentChange: 0 };
    }
    
    const recent = history.slice(-7);
    const averageScore = recent.reduce((sum, h) => sum + h.score, 0) / recent.length;
    
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, h) => sum + h.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, h) => sum + h.score, 0) / secondHalf.length;
    
    const recentChange = secondAvg - firstAvg;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentChange > 0.1) trend = 'improving';
    else if (recentChange < -0.1) trend = 'declining';
    
    return { trend, averageScore, recentChange };
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();
