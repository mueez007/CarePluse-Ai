# 💙 CarePulse AI

## AI-Powered Preventive Healthcare Companion for Elderly & Chronic Patients

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Problem Statement

**"Design an AI-powered platform for early screening of lifestyle diseases (diabetes, hypertension, heart disease, anemia) with continuous care support for elderly and chronically ill patients."**

### 7 Critical Healthcare Gaps We Solve:

| # | Problem | Our Solution |
|---|---------|--------------|
| 1 | No early screening for lifestyle diseases | AI Risk Score Calculator (IDRS, Framingham models) |
| 2 | Elderly forget 50% of medications | Voice Call Reminders in 5+ languages |
| 3 | Patients unknowingly eat harmful food | AI Food Scanner with personalized risk alerts |
| 4 | Generic advice ignores individual conditions | Digital Twin Health Profile |
| 5 | Emotional loneliness among elderly | 24/7 AI Emotional Companion |
| 6 | No real-time monitoring for families | Emergency Alert System |
| 7 | Reactive healthcare (only after emergencies) | Preventive alerts before emergencies |

---

## 🚀 Features

### ✅ Core Features (Implemented)

| Feature | Description | Status |
|---------|-------------|--------|
| **AI Risk Screening** | Diabetes (IDRS), Hypertension (Framingham), Heart Disease, Anemia | ✅ Complete |
| **Food Safety Scanner** | AI vision-based meal analysis using Gemini AI | ✅ Complete |
| **Medication Management** | Schedule tracking + adherence monitoring | ✅ Complete |
| **Voice Call Reminders** | Automated calls via Twilio | ✅ Complete |
| **Emotional AI Companion** | 24/7 chat support with sentiment analysis | ✅ Complete |
| **Symptom Checker** | AI-powered symptom analysis with urgency detection | ✅ Complete |
| **Digital Twin Profile** | Personalized health dashboard | ✅ Complete |
| **Emergency Alerts** | SMS/notification to caregivers | ✅ Complete |
| **Multilingual Support** | English, Hindi, Kannada, Tamil, Telugu | ✅ Complete |

### 🔮 Future Scope

- Wearable device integration (heart rate monitoring)
- Telemedicine consultation
- Health camp mode (bulk screening)
- More Indian languages

---

## 🏗️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | Next.js 14 + TypeScript | Web application |
| **Styling** | Tailwind CSS + Framer Motion | UI & animations |
| **UI Components** | shadcn/ui + Lucide Icons | Glassmorphism design |
| **Database/Auth** | Supabase | PostgreSQL, Auth, Storage |
| **AI - Vision** | Google Gemini 1.5 Flash | Food analysis, prescription OCR |
| **AI - Chat** | Groq (Llama 3.2 90B) | Emotional companion |
| **Voice Input** | Browser SpeechRecognition API | Speech-to-text (free) |
| **Voice Output** | Browser SpeechSynthesis API | Text-to-speech (free) |
| **Voice Calls** | Twilio | Automated medication reminders |

---

## 📁 Project Structure
carepulse-ai/
├── app/
│ ├── (auth)/ # Authentication & Onboarding
│ │ ├── login/
│ │ ├── signup/
│ │ └── onboarding/ # 7-screen cinematic flow
│ ├── (dashboard)/ # Main app
│ │ ├── dashboard/ # Home dashboard
│ │ ├── food-scanner/ # AI food analysis
│ │ ├── medications/ # Medication tracker
│ │ ├── ai-companion/ # Emotional chat
│ │ ├── risk-screening/ # Disease risk calculator
│ │ ├── symptom-checker/ # AI symptom analysis
│ │ ├── emergency/ # SOS & contacts
│ │ └── profile/ # Digital twin
│ └── api/ # Backend endpoints
├── components/
│ ├── ui/ # Reusable UI components
│ ├── dashboard/ # Dashboard widgets
│ └── onboarding/ # Onboarding screens
├── lib/
│ ├── supabase/ # Database client
│ ├── gemini/ # Gemini AI wrapper
│ ├── groq/ # Groq AI wrapper
│ ├── prompts/ # AI system prompts
│ └── utils/ # Helper functions
├── hooks/ # Custom React hooks
├── public/ # Static assets
└── types/ # TypeScript definitions



---

## 🔧 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free)
- Google Gemini API key (free tier available)
- Groq API key (free)
- Twilio account (optional, for voice calls)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/carepulse-ai.git
cd carepulse-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local

# 4. Edit .env.local with your API keys
nano .env.local

# 5. Run development server
npm run dev

# 6. Open http://localhost:3000

Environment Variables
env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Google Gemini AI
GEMINI_API_KEY=your_key

# Groq AI
GROQ_API_KEY=your_key

# Twilio (optional - for voice calls)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number

🎮 Demo Flow
Step	Action
1	User signs up with Google or email
2	Cinematic onboarding (7 screens)
3	Digital twin health profile created
4	Dashboard shows personalized insights
5	User scans food → AI analyzes health risk
6	User checks disease risk scores
7	User talks to emotional AI companion
8	Emergency SOS alerts caregiver


📊 Algorithms Used
Disease	Algorithm	Source
Diabetes	IDRS (Indian Diabetes Risk Score)	ICMR-INDIAB Study
Hypertension	Framingham Hypertension Risk Score	Framingham Heart Study
Heart Disease	Framingham Risk Score (10-year CVD)	Framingham Heart Study
Anemia	WHO Anemia Risk Scoring	World Health Organization
Symptom Analysis	Rule-Based Pattern Matching	Custom


🧪 Testing
bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start


🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/amazing)

Commit changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/amazing)

Open a Pull Request


📝 License
MIT License


🙏 Acknowledgments
Google Gemini AI for vision capabilities

Groq for fast LLM responses

Supabase for backend infrastructure

Twilio for voice call automation

shadcn/ui for UI components