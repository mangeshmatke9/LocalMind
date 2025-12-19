from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional

from backend.llm import ask_llm, build_prompt
from backend import storage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static & templates
app.mount("/static", StaticFiles(directory="backend/static"), name="static")
templates = Jinja2Templates(directory="backend/templates")

class ChatRequest(BaseModel):
    chat_id: Optional[str] = None
    message: str

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/chats")
def get_chats():
    return storage.load_chats()

@app.post("/new-chat")
def new_chat():
    return {"chat_id": storage.new_chat()}

@app.post("/chat")
def chat(req: ChatRequest):
    chat_id = req.chat_id or storage.new_chat()

    storage.add_message(chat_id, "user", req.message)

    messages = storage.load_chats().get(chat_id, [])
    prompt = build_prompt(messages)

    response = ask_llm(prompt)

    storage.add_message(chat_id, "assistant", response)

    return {
        "chat_id": chat_id,
        "response": response
    }
