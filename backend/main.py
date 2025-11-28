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

# Initialize DashScope
# Ensure DASHSCOPE_API_KEY is set in .env
api_key = os.getenv("DASHSCOPE_API_KEY")
if not api_key:
    print("Warning: DASHSCOPE_API_KEY not found in environment variables.")

# App ID from Aliyun Console
APP_ID = os.getenv("APP_ID")
if not APP_ID:
    print("Warning: APP_ID not found in environment variables.")

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    profile_context: str | None = None  # Profile info (name, stage, personality type)

async def generate_stream(user_input: str, session_id: str = None, profile_context: str = None):
    try:
        from dashscope import Application
        from http import HTTPStatus
        
        # Prepend profile context to the user input if provided
        prompt = user_input
        if profile_context:
            prompt = f"{profile_context}\n\n{user_input}"
        
        responses = Application.call(
            app_id=APP_ID,
            prompt=prompt,
            session_id=session_id,
            api_key=api_key,
            stream=True,
            incremental_output=True
        )

        for response in responses:
            if response.status_code != HTTPStatus.OK:
                error_msg = {"type": "error", "content": f"Error {response.code}: {response.message}"}
                yield json.dumps(error_msg) + "\n"
                continue

            # Check if there is output text
            if response.output and response.output.text:
                yield json.dumps({
                    "type": "answer", 
                    "content": response.output.text,
                    "session_id": response.output.session_id
                }) + "\n"
                
    except Exception as e:
        yield json.dumps({"type": "error", "content": str(e)}) + "\n"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        generate_stream(request.message, request.session_id, request.profile_context), 
        media_type="application/x-ndjson"
    )

@app.get("/")
async def root():
    return {"message": "CyberWill Backend is running"}
