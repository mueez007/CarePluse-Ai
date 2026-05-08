#!/bin/bash

echo "🚀 Setting up CarePulse AI..."

# Install dependencies
npm install

# Copy environment example
cp .env.local.example .env.local

# Create .env.local with placeholders
echo "NEXT_PUBLIC_SUPABASE_URL=your_url_here" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here" >> .env.local
echo "GEMINI_API_KEY=your_gemini_key" >> .env.local
echo "GROQ_API_KEY=your_groq_key" >> .env.local
echo "TWILIO_ACCOUNT_SID=your_sid" >> .env.local
echo "TWILIO_AUTH_TOKEN=your_token" >> .env.local
echo "TWILIO_PHONE_NUMBER=your_phone" >> .env.local

# Build the project
npm run build

echo "✅ Setup complete!"
echo "📝 Update .env.local with your API keys"
echo "▶️ Run 'npm run dev' to start development"
