# CyberWill - Your Personal AI Dating Coach

CyberWill is a modern, AI-powered dating coach application designed to help you level up your dating game. It features a premium, cyber-aesthetic interface and provides real-time advice, profile reviews, and conversation starters.

## Features

-   **Real-time AI Chat**: Powered by DeepSeek V3 for intelligent and empathetic responses.
-   **Premium UI**: A vibrant, glassmorphic interface with smooth animations and a "cyber" aesthetic.
-   **Markdown Support**: Beautifully rendered text with bold emphasis and clear lists.
-   **Streaming Responses**: Experience a natural, typewriter-style response flow.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js** (v18 or higher)
-   **Python** (v3.10 or higher)
-   **Conda** (optional, but recommended for backend environment management)

## Setup Instructions

### 1. Backend Setup (FastAPI)

Navigate to the `backend` directory:

```bash
cd backend
```

Create and activate a virtual environment (using Conda):

```bash
conda create -n cyberwill python=3.10
conda activate cyberwill
```

Install the required dependencies:

```bash
pip install fastapi uvicorn openai python-dotenv
```

Create a `.env` file in the `backend` directory and add your API key:

```env
DEEPSEEK_API_KEY=your_api_key_here
```

Start the backend server:

```bash
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`.

### 2. Frontend Setup (Next.js)

Open a new terminal window and navigate to the `frontend` directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## How to Use

1.  Ensure both the backend and frontend servers are running.
2.  Open your browser and go to `http://localhost:3000`.
3.  You will be greeted by the CyberWill interface.
4.  Type your question or select one of the quick suggestions (e.g., "Analyze screenshot", "Date ideas").
5.  Press **Enter** or click the **Send** button to chat.
6.  To stop a response while it's generating, click the red **Stop** button.

## Testing

To verify the installation:

1.  **Backend**: Go to `http://localhost:8000/docs` to see the Swagger UI. You can test the `/chat` endpoint directly there.
2.  **Frontend**: Open the app in your browser. Send a message "Hello". You should see a streaming response from the AI.

## Technologies Used

-   **Frontend**: Next.js, React, Tailwind CSS, Framer Motion, Lucide React
-   **Backend**: FastAPI, Python, OpenAI Client (for DeepSeek API)
-   **Font**: Outfit (Google Fonts)
