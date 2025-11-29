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
        system_instruction = """
        重要指令：
        1. 回答时绝对不要提及“文档”、“参考资料”、“知识库”等词汇。
        2. 绝对不要使用“[1]”、“【doc】”等引用标记。
        3. 对女生保持尊重，不要使用贬低或侮辱性的语言。
        """
        
        prompt = f"{system_instruction}\n\n{user_input}"
        if profile_context:
            prompt = f"{system_instruction}\n\n{profile_context}\n\n{user_input}"
        
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

class AnalyzeRequest(BaseModel):
    name: str
    stage: str
    traits: dict

@app.post("/analyze-profile")
async def analyze_profile(request: AnalyzeRequest):
    try:
        from dashscope import Application
        from http import HTTPStatus
        
        prompt = f"""
        请根据以下信息分析这位女生的性格，并从以下8个原型中选择最匹配的一个（必须严格使用这8个名称之一）。
        
        判断逻辑（基于3个核心特质）：
        1. 邻家女孩 (Girl Next Door) = 投资型 + 感性 + 回避
        2. 灰姑娘 (Cinderella) = 投资型 + 感性 + 合理解释
        3. 鉴赏家 (Connoisseur) = 投资型 + 理性 + 回避
        4. 现代女人 (Modern Woman) = 投资型 + 理性 + 合理解释
        5. 冰美人 (Ice Queen) = 测试型 + 感性 + 回避
        6. 花蝴蝶 (Social Butterfly) = 测试型 + 感性 + 合理解释
        7. 女教父 (Godmother) = 测试型 + 理性 + 回避
        8. 勾引家 (Seductress) = 测试型 + 理性 + 合理解释

        详细原型描述参考：
        • 邻家女孩：真正意义上的传统女性，认为爱情必须忠贞且长久，但任性且极度缺乏安全感。
        • 灰姑娘：情绪敏感，升温很快且容易沦陷，喜欢坠入爱河的感觉，但容易因为性关系太快而被男人误解。
        • 鉴赏家：具有极强母性和付出欲的全能型贤内助，倾向于稳定安逸的生活，对伴侣有极高要求。
        • 现代女人：极其独立且有事业心，以健康实在的方式和男人打交道，既追求长期关系又享受现代开放生活。
        • 冰美人：外表冷漠高傲但内心善良单纯，通常长得漂亮且玩心重，对主动接近她的男人持冷漠态度。
        • 花蝴蝶：活泼乐观的“派对女孩”，追求快乐和刺激，容易主动追求男人，但不喜欢责任和约束。
        • 女教父：强势的女性领袖，极度钟情于事业和成就，看重现实价值，在感情中需要掌握主动权。
        • 勾引家：自信、独立、性感、冷静的综合体，是所有类型中最懂得使用手段的女人，享受竞争。

        用户信息:
        姓名/昵称: {request.name}
        关系阶段: {request.stage}
        
        核心特质:
        1. {request.traits.get('investment', '未知')} (对应 投资型/测试型)
        2. {request.traits.get('rationality', '未知')} (对应 理性/感性)
        3. {request.traits.get('openness', '未知')} (对应 合理解释/回避)
        
        请严格以JSON格式输出，不要包含Markdown格式标记（如```json）,把知识库中的信息用你的语言组织，不要直接说”这是在知识库中的信息“：
        {{
            "archetype": "从上述8个名称中选一个（例如：邻家女孩）",
            "analysis": "详细的性格分析，结合她的特质和原型进行深度解读..."
        }}
        """
        
        response = Application.call(
            app_id=APP_ID,
            prompt=prompt,
            api_key=api_key,
        )

        if response.status_code != HTTPStatus.OK:
            raise HTTPException(status_code=500, detail=f"Error {response.code}: {response.message}")

        if response.output and response.output.text:
            # Clean up potential markdown code blocks
            content = response.output.text.replace("```json", "").replace("```", "").strip()
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "archetype": "未知类型",
                    "analysis": content
                }
        
        raise HTTPException(status_code=500, detail="No output from AI")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
