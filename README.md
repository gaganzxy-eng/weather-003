# 🌦️ Weather AI — Premium 3D Weather Platform

Weather AI is a state-of-the-art, premium weather forecasting web application featuring an interactive 3D Earth Globe background, dynamic weather particle systems, and AI-powered weather insights and conversational assistance.

This platform is completely self-contained and ready to deploy on **Vercel** with one click.

## ✨ Features
- 🌍 **3D Interactive Earth Globe**: Fully customizable abstract globe rendered in real-time, responsive to drag and orbit gestures.
- 📍 **Pulsing Location Beacon**: Displays your real-time geolocation tracked directly onto the 3D globe.
- ⚡ **Dynamic Weather Particles**: Instanced rain and snow rendering mapped dynamically to the current city's weather code.
- 📊 **Rich Weather Analytics**: Current weather, 24-hour hourly forecast, and a 15-day forecast alongside circular gauges for UV Index, Air Quality, Humidity, Visibility, Wind, and more.
- 📈 **Interactive Tabbed ECharts**: Zoomable, pannable, and beautifully styled charts for temperature, rain, wind, and AQI.
- 🧠 **AI Weather Insights**: Automatically generates personalized, conversational summaries explaining what the forecast numbers mean for your day.
- 🤖 **AI Weather Chatbot**: A floating helper widget that provides weather-specific suggestions (e.g., what to wear, daily advice) using the latest Groq models.
- 🌓 **Premium UI/UX Design**: Elegant glassmorphism aesthetic with full support for light/dark mode and °C/°F unit conversions.

---

## 🛠️ Technologies Used

### Frontend (Next.js App)
- **Framework**: [Next.js 15+](https://nextjs.org/) (React 19)
- **3D Graphics & Rendering**: 
  - [Three.js](https://threejs.org/)
  - [React Three Fiber (R3F)](https://r3f.docs.pmnd.rs/getting-started/introduction)
  - [@react-three/drei](https://github.com/pmndrs/drei)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Apache ECharts](https://echarts.apache.org/) (via `echarts-for-react`)
- **Interactive UI Components**: `react-parallax-tilt` (for 3D card tilt effects), `lucide-react` (icons)
- **Styling**: Vanilla CSS with custom theme variables for Dark & Light modes.

### Backend (Serverless Routes)
- **Next.js Route Handlers**: Replaces Python FastAPI for monolithic deployments on Vercel.
- **AI Engine**: [Groq Cloud API](https://groq.com/) using the `Llama-3-70b-8192` model.
- **Weather Data APIs**: [Open-Meteo API](https://open-meteo.com/) (Weather forecasts & Historical weather archive).

---

## ⚙️ Local Setup Instructions

1. Clone this repository:
   ```bash
   git clone https://github.com/gaganzxy-eng/weather-003.git
   cd weather-003/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file inside the `frontend` folder and add your API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Launch the local dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Vercel Deployment

Deploying the frontend Next.js app to Vercel requires zero complex backend configurations!
1. Import your GitHub repository to Vercel.
2. In **Environment Variables**, add:
   - `GROQ_API_KEY`: Add your Groq API key here.
3. Click **Deploy**.

---

## 👨‍💻 Author
Built with ❤️ by **R.Gagan Surya Teja**
