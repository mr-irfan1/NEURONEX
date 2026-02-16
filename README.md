# NEURONEX

An AI-powered learning platform that combines interactive coding, smart note-taking, and personalized tutoring to enhance your programming journey.

## Features

- **Dashboard**: Track your learning progress, streaks, and analytics
- **Smart Notebook**: AI-enhanced note-taking with automatic summarization and tagging
- **Coding Ground**: Interactive code editor with AI-powered analysis and feedback
- **Avatar Tutor**: Personalized AI tutor for real-time learning assistance
- **Newsletter**: Stay updated with the latest features and learning resources

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for fast development and building
- React Router for navigation
- Lucide React for icons
- Recharts for data visualization
- Google Generative AI (Gemini) integration

### Backend
- FastAPI (Python)
- Pydantic for data validation
- Uvicorn ASGI server

## Prerequisites

- Node.js (v18 or higher)
- Python 3.8+ (for backend)
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation & Setup

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mr-irfan1/NEURONEX.git
   cd NEURONEX
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn pydantic[email]
   ```

3. Run the backend server:
   ```bash
   python main.py
   ```

4. Backend API will be available at `http://localhost:8000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
NEURONEX/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, GlassCard)
│   ├── Layout.tsx      # Main layout wrapper
│   └── Sidebar.tsx     # Navigation sidebar
├── pages/              # Application pages
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Notebook.tsx    # Note-taking interface
│   ├── CodingGround.tsx # Code editor
│   ├── AvatarTutor.tsx # AI tutor chat
│   └── Settings.tsx    # User settings
├── services/           # API and service integrations
│   ├── aiService.ts    # Gemini AI integration
│   └── newsletterService.ts # Newsletter API
├── backend/            # FastAPI backend
│   └── main.py        # API endpoints
├── App.tsx            # Main app component
├── types.ts           # TypeScript type definitions
└── constants.ts       # App constants

```

## API Endpoints

### Newsletter Subscription
- **POST** `/api/newsletter/subscribe`
  - Subscribe to newsletter updates
  - Request body: `{ "email": "user@example.com" }`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Contact

For questions or support, please open an issue on GitHub.

THANK YOU
