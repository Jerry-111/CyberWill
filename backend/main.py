import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client for Aliyun/DeepSeek
# Ensure DASHSCOPE_API_KEY is set in .env
api_key = os.getenv("DASHSCOPE_API_KEY")
if not api_key:
    print("Warning: DASHSCOPE_API_KEY not found in environment variables.")

client = OpenAI(
    api_key=api_key,
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

class ChatRequest(BaseModel):
    message: str

async def generate_stream(user_input: str):
    messages = [
        {"role": "system", "content": "You are a helpful AI dating coach. Format your responses beautifully using Markdown. Do NOT use # (H1). Can sometimes use ## (H2) for titles; use ### (H3) or bold text instead to keep headings compact."},
        {"role": "user", "content": user_input}
    ]
    try:
        completion = client.chat.completions.create(
            model="deepseek-v3.2-exp", 
            messages=messages,
            stream=True,
            stream_options={"include_usage": True},
        )

        for chunk in completion:
            delta = chunk.choices[0].delta if chunk.choices else None
            
            if delta:
                # Check for actual answer content
                if hasattr(delta, "content") and delta.content:
                    yield json.dumps({"type": "answer", "content": delta.content}) + "\n"
    except Exception as e:
        yield json.dumps({"type": "error", "content": str(e)}) + "\n"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(generate_stream(request.message), media_type="application/x-ndjson")

@app.get("/")
async def root():
    return {"message": "CyberWill Backend is running"}
