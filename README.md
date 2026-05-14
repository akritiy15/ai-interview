# 🎯 Interview Readiness Score

An AI-powered web application that evaluates your job hunt readiness across 4 critical pillars: **Technical Skills**, **Resume Quality**, **Communication**, and **Portfolio**. Built with React and powered by the **Google Gemini 2.0 Flash** API.

This project was built as a hackathon prototype to provide students and job seekers with a quick, brutally honest assessment and actionable feedback to improve their chances of landing their target role.

## ✨ Features

- **Smart Intake Form**: A fast, step-by-step form with dynamic skill selection and progress tracking, designed to be completed in under 2 minutes.
- **AI Analysis**: Integrates directly with the Google Gemini API to analyze the candidate's profile against their target role (Software Engineer, Data Analyst, PM, etc.).
- **Interactive Results Dashboard**:
  - **Overall Score Dial**: Animated circular dial visualizing the final readiness score.
  - **Radar Chart**: Maps the candidate's profile shape against a "Job-Ready" benchmark.
  - **Strengths & Critical Gaps**: Clear breakdown of what they are doing right and what is hurting their chances.
  - **3-Week Action Plan**: A customized checklist of tasks to level up their readiness over the next 3 weeks.
  - **Quick Wins**: Tasks completable within 48 hours to immediately boost their profile.
- **Responsive & Premium UI**: Built with Tailwind CSS, featuring glassmorphism cards, glowing accent colors, and smooth animations.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Model**: Google Gemini (`gemini-2.0-flash`)

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate to the project folder:
   ```bash
   cd interview-readiness
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Environment Variables:
   Create a `.env` file in the root of the project and add your Google Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY="your_api_key_here"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser to view the app!

## 💡 Usage Notes

- **API Fallback**: If you do not have a Gemini API key configured or the API request fails, the app provides a **"Bypass AI (Use Mock Data)"** button on the error screen. This allows you to still fully demo the UI and dashboard features.
- **Timer**: A countdown timer runs automatically to encourage quick, intuitive answers.

## 📜 License
This project is open-source and available under the MIT License.
# Screenshots

## Home Page
![Home](screenshots/home.png)

## Form Page 1
![Page1](screenshots/page1.png)

## Form Page 2
![Page2](screenshots/page2.png)

## Form Page 3
![Page3](screenshots/page3.png)

## Result Screen 1
![Result1](screenshots/result1.png)

## Result Screen 2
![Result2](screenshots/result2.png)

## Result Screen 3
![Result3](screenshots/result3.png)
