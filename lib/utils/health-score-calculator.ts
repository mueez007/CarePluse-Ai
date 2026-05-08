export interface HealthMetrics {
  medicationAdherence: number;  // 0-100
  foodSafetyScore: number;       // 0-100
  emotionalWellness: number;     // 0-100
  activityLevel?: number;        // 0-100
  sleepQuality?: number;         // 0-100
  vitalSigns?: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    bloodSugar?: number;
  };
}

export interface HealthConditions {
  diabetes?: boolean;
  highBP?: boolean;
  heartDisease?: boolean;
  kidneyDisease?: boolean;
  asthma?: boolean;
  arthritis?: boolean;
}

export class HealthScoreCalculator {
  private metrics: HealthMetrics;
  private conditions: HealthConditions;

  constructor(metrics: HealthMetrics, conditions: HealthConditions = {}) {
    this.metrics = metrics;
    this.conditions = conditions;
  }

  calculateOverallScore(): number {
    let score = 0;
    let weightSum = 0;

    // Medication adherence (weight: 35%)
    if (this.metrics.medicationAdherence !== undefined) {
      score += this.metrics.medicationAdherence * 0.35;
      weightSum += 0.35;
    }

    // Food safety (weight: 25%)
    if (this.metrics.foodSafetyScore !== undefined) {
      score += this.metrics.foodSafetyScore * 0.25;
      weightSum += 0.25;
    }

    // Emotional wellness (weight: 20%)
    if (this.metrics.emotionalWellness !== undefined) {
      score += this.metrics.emotionalWellness * 0.20;
      weightSum += 0.20;
    }

    // Activity level (weight: 10%)
    if (this.metrics.activityLevel !== undefined) {
      score += this.metrics.activityLevel * 0.10;
      weightSum += 0.10;
    }

    // Sleep quality (weight: 10%)
    if (this.metrics.sleepQuality !== undefined) {
      score += this.metrics.sleepQuality * 0.10;
      weightSum += 0.10;
    }

    // Apply condition penalties
    const conditionPenalty = this.calculateConditionPenalty();
    score = score * (1 - conditionPenalty);

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private calculateConditionPenalty(): number {
    let penalty = 0;
    
    if (this.conditions.diabetes) penalty += 0.05;
    if (this.conditions.highBP) penalty += 0.05;
    if (this.conditions.heartDisease) penalty += 0.10;
    if (this.conditions.kidneyDisease) penalty += 0.10;
    if (this.conditions.asthma) penalty += 0.03;
    if (this.conditions.arthritis) penalty += 0.03;
    
    return Math.min(0.3, penalty);
  }

  getRiskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const score = this.calculateOverallScore();
    
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const score = this.calculateOverallScore();

    if (this.metrics.medicationAdherence < 80) {
      recommendations.push("Set up voice reminders for medications");
      recommendations.push("Use the medication tracking feature");
    }

    if (this.metrics.foodSafetyScore < 70) {
      recommendations.push("Use the food scanner before meals");
      recommendations.push("Consult a nutritionist for diet planning");
    }

    if (this.metrics.emotionalWellness < 65) {
      recommendations.push("Talk to the AI companion daily");
      recommendations.push("Try breathing exercises for stress relief");
    }

    if (score < 60) {
      recommendations.push("Schedule a check-up with your doctor");
      recommendations.push("Review your health conditions and medications");
    }

    return recommendations.slice(0, 5);
  }

  getTrend(previousScore: number): 'improving' | 'stable' | 'declining' {
    const currentScore = this.calculateOverallScore();
    const difference = currentScore - previousScore;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }
}

export function calculateFoodHealthScore(
  sugarContent: 'low' | 'medium' | 'high',
  fatContent: 'low' | 'medium' | 'high',
  sodiumContent: 'low' | 'medium' | 'high',
  hasAllergens: boolean,
  userConditions: HealthConditions
): number {
  let score = 100;
  
  // Sugar penalty
  if (sugarContent === 'high') score -= 25;
  else if (sugarContent === 'medium') score -= 10;
  
  // Fat penalty
  if (fatContent === 'high') score -= 20;
  else if (fatContent === 'medium') score -= 8;
  
  // Sodium penalty
  if (sodiumContent === 'high') score -= 20;
  else if (sodiumContent === 'medium') score -= 8;
  
  // Allergen penalty
  if (hasAllergens) score -= 30;
  
  // Condition-specific penalties
  if (userConditions.diabetes && sugarContent !== 'low') score -= 15;
  if (userConditions.highBP && sodiumContent !== 'low') score -= 15;
  if (userConditions.heartDisease && fatContent !== 'low') score -= 15;
  
  return Math.max(0, Math.min(100, score));
}
