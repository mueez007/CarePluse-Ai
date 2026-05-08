import { NextRequest, NextResponse } from 'next/server';
import RiskCalculator from '@/lib/utils/risk-calculators';

export async function POST(request: NextRequest) {
  try {
    const { riskType, inputs } = await request.json();

    if (!riskType || !inputs) {
      return NextResponse.json(
        { error: 'Risk type and inputs are required' },
        { status: 400 }
      );
    }

    let result;

    switch (riskType) {
      case 'diabetes':
        result = RiskCalculator.calculateDiabetesRisk(inputs);
        break;
      case 'hypertension':
        result = RiskCalculator.calculateHypertensionRisk(inputs);
        break;
      case 'heart':
        result = RiskCalculator.calculateHeartRisk(inputs);
        break;
      case 'anemia':
        result = RiskCalculator.calculateAnemiaRisk(inputs);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid risk type' },
          { status: 400 }
        );
    }

    // Add disclaimer to response
    const disclaimer = "This risk assessment is for informational purposes only. Please consult a healthcare professional for medical advice.";

    return NextResponse.json({
      success: true,
      ...result,
      disclaimer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Risk calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate risk' },
      { status: 500 }
    );
  }
}

// GET endpoint to get risk level descriptions
export async function GET(request: NextRequest) {
  const riskLevel = request.nextUrl.searchParams.get('level');

  const descriptions = {
    low: {
      level: 'Low Risk',
      color: 'green',
      message: 'Your risk factors are minimal. Maintain healthy lifestyle habits.',
      action: 'Continue regular health checkups annually.'
    },
    medium: {
      level: 'Medium Risk',
      color: 'yellow',
      message: 'Some risk factors identified. Lifestyle modifications recommended.',
      action: 'Schedule a health checkup within 3 months.'
    },
    high: {
      level: 'High Risk',
      color: 'orange',
      message: 'Significant risk factors present. Medical evaluation recommended.',
      action: 'Consult a doctor within 1-2 weeks for proper assessment.'
    },
    'very-high': {
      level: 'Very High Risk',
      color: 'red',
      message: 'Multiple high-risk factors identified. Immediate action needed.',
      action: 'Please consult a healthcare professional as soon as possible.'
    }
  };

  if (riskLevel && descriptions[riskLevel as keyof typeof descriptions]) {
    return NextResponse.json(descriptions[riskLevel as keyof typeof descriptions]);
  }

  return NextResponse.json(descriptions);
}
