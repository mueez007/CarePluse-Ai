import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email } = body;

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, email' },
        { status: 400 }
      );
    }

    // Store profile data
    // In production, this would save to Supabase database
    // For now, we acknowledge the profile creation
    const profile = {
      id,
      name,
      email,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
      healthProfile: null,
    };

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile created successfully',
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch from Supabase using the auth token
    // For now, return user data from localStorage (client-side)
    return NextResponse.json({
      success: true,
      message: 'Use client-side localStorage for user data in development',
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
