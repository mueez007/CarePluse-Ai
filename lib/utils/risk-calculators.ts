export interface DiabetesRiskInputs {
  age: number;
  gender: 'male' | 'female';
  familyHistory: boolean;
  bmi: number;
  waistCircumference: number;
  physicalActivity: 'low' | 'medium' | 'high';
  dietType: 'vegetarian' | 'non-vegetarian' | 'mixed';
  hypertension: boolean;
  gestationalDiabetes?: boolean;
}

export interface HypertensionRiskInputs {
  age: number;
  gender: 'male' | 'female';
  familyHistory: boolean;
  bmi: number;
  saltIntake: 'low' | 'medium' | 'high';
  physicalActivity: 'low' | 'medium' | 'high';
  alcoholConsumption: 'none' | 'occasional' | 'regular';
  stressLevel: 'low' | 'medium' | 'high';
  diabetes: boolean;
}

export interface HeartRiskInputs {
  age: number;
  gender: 'male' | 'female';
  smoker: boolean;
  diabetes: boolean;
  hypertension: boolean;
  totalCholesterol: number;
  hdlCholesterol: number;
  systolicBP: number;
  bmi: number;
}

export interface AnemiaRiskInputs {
  age: number;
  gender: 'male' | 'female';
  pregnancyStatus?: boolean;
  menstrualHistory?: 'regular' | 'heavy' | 'irregular' | 'menopause';
  dietType: 'vegetarian' | 'non-vegetarian';
  fatigue: boolean;
  paleSkin: boolean;
  dizziness: boolean;
}

export interface RiskResult {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  percentage: number;
  recommendations: string[];
  factors: string[];
}

export class RiskCalculator {
  static calculateDiabetesRisk(inputs: DiabetesRiskInputs): RiskResult {
    let score = 0;
    const factors: string[] = [];

    // Age scoring
    if (inputs.age >= 60) { score += 4; factors.push('Age 60+ years'); }
    else if (inputs.age >= 45) { score += 3; factors.push('Age 45-59 years'); }
    else if (inputs.age >= 35) { score += 1; factors.push('Age 35-44 years'); }

    // BMI scoring
    if (inputs.bmi >= 30) { score += 4; factors.push('BMI 30+ (Obese)'); }
    else if (inputs.bmi >= 25) { score += 2; factors.push('BMI 25-29.9 (Overweight)'); }

    // Waist circumference
    const highRiskWaist = inputs.gender === 'male' ? 90 : 80;
    if (inputs.waistCircumference >= highRiskWaist) {
      score += 3;
      factors.push('High waist circumference');
    }

    // Family history
    if (inputs.familyHistory) {
      score += 5;
      factors.push('Family history of diabetes');
    }

    // Physical activity
    if (inputs.physicalActivity === 'low') {
      score += 3;
      factors.push('Low physical activity');
    }

    // Hypertension
    if (inputs.hypertension) {
      score += 2;
      factors.push('High blood pressure');
    }

    // Gestational diabetes (for females)
    if (inputs.gender === 'female' && inputs.gestationalDiabetes) {
      score += 4;
      factors.push('History of gestational diabetes');
    }

    const maxScore = 25;
    const percentage = Math.min(100, Math.round((score / maxScore) * 100));
    const riskLevel = this.getRiskLevel(percentage);
    const recommendations = this.getDiabetesRecommendations(inputs, riskLevel);

    return { score, riskLevel, percentage, recommendations, factors };
  }

  static calculateHypertensionRisk(inputs: HypertensionRiskInputs): RiskResult {
    let score = 0;
    const factors: string[] = [];

    // Age scoring
    if (inputs.age >= 60) { score += 5; factors.push('Age 60+ years'); }
    else if (inputs.age >= 50) { score += 3; factors.push('Age 50-59 years'); }

    // BMI
    if (inputs.bmi >= 30) { score += 4; factors.push('BMI 30+ (Obese)'); }
    else if (inputs.bmi >= 25) { score += 2; factors.push('BMI 25-29.9 (Overweight)'); }

    // Salt intake
    if (inputs.saltIntake === 'high') {
      score += 4;
      factors.push('High salt intake');
    }

    // Physical activity
    if (inputs.physicalActivity === 'low') {
      score += 3;
      factors.push('Sedentary lifestyle');
    }

    // Family history
    if (inputs.familyHistory) {
      score += 4;
      factors.push('Family history of hypertension');
    }

    // Stress
    if (inputs.stressLevel === 'high') {
      score += 3;
      factors.push('High stress level');
    }

    // Alcohol
    if (inputs.alcoholConsumption === 'regular') {
      score += 3;
      factors.push('Regular alcohol consumption');
    }

    // Diabetes
    if (inputs.diabetes) {
      score += 4;
      factors.push('Has diabetes');
    }

    const maxScore = 30;
    const percentage = Math.min(100, Math.round((score / maxScore) * 100));
    const riskLevel = this.getRiskLevel(percentage);
    const recommendations = this.getHypertensionRecommendations(inputs, riskLevel);

    return { score, riskLevel, percentage, recommendations, factors };
  }

  static calculateHeartRisk(inputs: HeartRiskInputs): RiskResult {
    let score = 0;
    const factors: string[] = [];

    // Age
    if (inputs.age >= 65) { score += 6; factors.push('Age 65+ years'); }
    else if (inputs.age >= 55) { score += 4; factors.push('Age 55-64 years'); }

    // Smoking
    if (inputs.smoker) {
      score += 8;
      factors.push('Current smoker');
    }

    // Diabetes
    if (inputs.diabetes) {
      score += 6;
      factors.push('Diabetes');
    }

    // Hypertension
    if (inputs.hypertension) {
      score += 5;
      factors.push('Hypertension');
    }

    // Cholesterol ratio (Total/HDL)
    const cholesterolRatio = inputs.totalCholesterol / inputs.hdlCholesterol;
    if (cholesterolRatio >= 5) {
      score += 5;
      factors.push('High cholesterol ratio');
    }
    else if (cholesterolRatio >= 4) {
      score += 3;
      factors.push('Moderately high cholesterol');
    }

    // Systolic BP
    if (inputs.systolicBP >= 160) {
      score += 4;
      factors.push('Very high systolic BP');
    }
    else if (inputs.systolicBP >= 140) {
      score += 2;
      factors.push('High systolic BP');
    }

    // BMI
    if (inputs.bmi >= 30) {
      score += 3;
      factors.push('Obese');
    }

    const maxScore = 40;
    const percentage = Math.min(100, Math.round((score / maxScore) * 100));
    const riskLevel = this.getRiskLevel(percentage);
    const recommendations = this.getHeartRecommendations(inputs, riskLevel);

    return { score, riskLevel, percentage, recommendations, factors };
  }

  static calculateAnemiaRisk(inputs: AnemiaRiskInputs): RiskResult {
    let score = 0;
    const factors: string[] = [];

    // Age and gender specific risks
    if (inputs.gender === 'female') {
      score += 3;
      factors.push('Female gender - higher anemia risk');
      
      if (inputs.pregnancyStatus) {
        score += 5;
        factors.push('Pregnancy increases iron requirement');
      }
      
      if (inputs.menstrualHistory === 'heavy') {
        score += 4;
        factors.push('Heavy menstrual bleeding');
      } else if (inputs.menstrualHistory === 'menopause') {
        score += 0;
      } else {
        score += 2;
        factors.push('Regular menstruation');
      }
    }

    // Age specific
    if (inputs.age >= 60) {
      score += 2;
      factors.push('Age 60+ years');
    }

    // Diet type
    if (inputs.dietType === 'vegetarian') {
      score += 4;
      factors.push('Vegetarian diet - lower iron absorption');
    }

    // Symptoms
    if (inputs.fatigue) {
      score += 3;
      factors.push('Fatigue reported');
    }
    if (inputs.paleSkin) {
      score += 3;
      factors.push('Pale skin observed');
    }
    if (inputs.dizziness) {
      score += 3;
      factors.push('Dizziness reported');
    }

    const maxScore = 25;
    const percentage = Math.min(100, Math.round((score / maxScore) * 100));
    const riskLevel = this.getRiskLevel(percentage);
    const recommendations = this.getAnemiaRecommendations(inputs, riskLevel);

    return { score, riskLevel, percentage, recommendations, factors };
  }

  private static getRiskLevel(percentage: number): 'low' | 'medium' | 'high' | 'very-high' {
    if (percentage < 30) return 'low';
    if (percentage < 50) return 'medium';
    if (percentage < 70) return 'high';
    return 'very-high';
  }

  private static getDiabetesRecommendations(inputs: DiabetesRiskInputs, riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    recommendations.push('Monitor blood sugar levels regularly');
    
    if (riskLevel === 'high' || riskLevel === 'very-high') {
      recommendations.push('Consult a doctor for diabetes screening immediately');
      recommendations.push('Consider HbA1c test every 3 months');
    }
    
    if (inputs.physicalActivity === 'low') {
      recommendations.push('Increase physical activity - walk 30 minutes daily');
    }
    
    if (inputs.bmi >= 25) {
      recommendations.push('Work towards healthy weight loss - reduce 5-10% body weight');
    }
    
    recommendations.push('Reduce sugar and refined carbohydrates from diet');
    recommendations.push('Include more fiber-rich foods like whole grains and vegetables');
    
    return recommendations;
  }

  private static getHypertensionRecommendations(inputs: HypertensionRiskInputs, riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'high' || riskLevel === 'very-high') {
      recommendations.push('Immediate blood pressure check recommended');
      recommendations.push('Consult a doctor for proper diagnosis');
    }
    
    if (inputs.saltIntake === 'high') {
      recommendations.push('Reduce salt intake - avoid processed foods and extra salt');
    }
    
    if (inputs.physicalActivity === 'low') {
      recommendations.push('Start regular exercise - 30 minutes of walking daily');
    }
    
    if (inputs.stressLevel !== 'low') {
      recommendations.push('Practice stress management - deep breathing, meditation');
    }
    
    recommendations.push('Monitor blood pressure at home regularly');
    recommendations.push('Limit alcohol and avoid smoking');
    
    return recommendations;
  }

  private static getHeartRecommendations(inputs: HeartRiskInputs, riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'high' || riskLevel === 'very-high') {
      recommendations.push('Consult a cardiologist immediately');
      recommendations.push('Complete cardiac health check-up recommended');
    }
    
    if (inputs.smoker) {
      recommendations.push('Quit smoking - seek professional help if needed');
    }
    
    if (inputs.bmi >= 25) {
      recommendations.push('Maintain healthy weight through diet and exercise');
    }
    
    recommendations.push('Eat heart-healthy diet - more fruits, vegetables, whole grains');
    recommendations.push('Control diabetes and blood pressure if present');
    recommendations.push('Regular cholesterol monitoring every 6 months');
    
    return recommendations;
  }

  private static getAnemiaRecommendations(inputs: AnemiaRiskInputs, riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'high' || riskLevel === 'very-high') {
      recommendations.push('Get a complete blood count test immediately');
      recommendations.push('Consult a doctor for iron supplementation');
    }
    
    if (inputs.dietType === 'vegetarian') {
      recommendations.push('Increase iron-rich foods - spinach, lentils, fortified cereals');
      recommendations.push('Consume vitamin C with meals to improve iron absorption');
    }
    
    recommendations.push('Include iron-rich foods like dates, jaggery, beetroot');
    recommendations.push('Avoid tea/coffee immediately after meals');
    
    return recommendations;
  }
}

export default RiskCalculator;
