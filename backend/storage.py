import json
import os
import uuid

DATA_FILE = "data/chats.json"

os.makedirs("data", exist_ok=True)

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump({}, f)

def load_chats():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_chats(chats):
    with open(DATA_FILE, "w") as f:
        json.dump(chats, f, indent=2)

def new_chat():
    chat_id = str(uuid.uuid4())
    chats = load_chats()
    chats[chat_id] = []
    save_chats(chats)
    return chat_id

def add_message(chat_id, role, content):
    chats = load_chats()
    chats.setdefault(chat_id, [])
    chats[chat_id].append({
        "role": role,
        "content": content
    })
    save_chats(chats)
