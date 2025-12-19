let currentChat = null;

/* ================= Load Sidebar ================= */

async function loadChats() {
  const res = await fetch("/chats");
  const chats = await res.json();

  const list = document.getElementById("chatList");
  list.innerHTML = "";

  Object.keys(chats).forEach(chatId => {
    const item = document.createElement("div");
    item.className = "chat-item";

    const firstUserMessage =
      chats[chatId].find(m => m.role === "user")?.content || "New chat";

    item.innerText = firstUserMessage.slice(0, 30);
    item.onclick = () => openChat(chatId);

    list.appendChild(item);
  });
}

function handleEnter(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}

/* ================= Open Chat ================= */

async function openChat(chatId) {
  currentChat = chatId;

  const res = await fetch("/chats");
  const chats = await res.json();
  const messages = chats[chatId] || [];

  const box = document.getElementById("messages");
  box.innerHTML = "";

  messages.forEach(m => renderMessage(m.role, m.content));
  box.scrollTop = box.scrollHeight;
}

/* ================= New Chat ================= */

async function newChat() {
  const res = await fetch("/new-chat", { method: "POST" });
  const data = await res.json();

  currentChat = data.chat_id;
  document.getElementById("messages").innerHTML = "";

  loadChats();
}

/* ================= Send Message ================= */

async function send() {
  const input = document.getElementById("input");
  if (!input.value.trim()) return;

  const text = input.value;
  input.value = "";

  const box = document.getElementById("messages");

  // User message
  const userRow = document.createElement("div");
  userRow.className = "message-row user";
  userRow.innerHTML = `<div class="message">${text}</div>`;
  box.appendChild(userRow);
  box.scrollTop = box.scrollHeight;

  // Thinking indicator
  const thinkingRow = document.createElement("div");
  thinkingRow.className = "message-row assistant";

  thinkingRow.id = "thinking";

  thinkingRow.innerHTML = `
    <div class="message">
      <div class="thinking">
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
      </div>
    </div>
  `;
  box.appendChild(thinkingRow);
  box.scrollTop = box.scrollHeight;

  // Send request
  const res = await fetch("http://127.0.0.1:9999/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: currentChat, message: text })
  });

  const data = await res.json();
  currentChat = data.chat_id;

  // Remove thinking indicator
  document.getElementById("thinking")?.remove();

  // Assistant message
  const botRow = document.createElement("div");
  botRow.className = "message-row assistant";
  botRow.innerHTML = `<div class="message">${data.response}</div>`;
  box.appendChild(botRow);

  box.scrollTop = box.scrollHeight;
  loadChats();
}


/* ================= Render ================= */

function renderMessage(role, content) {
  const box = document.getElementById("messages");

  const row = document.createElement("div");
  row.className = `message-row ${role === "assistant" ? "assistant" : "user"}`;

  const msg = document.createElement("div");
  msg.className = "message";
  msg.innerText = content;

  row.appendChild(msg);
  box.appendChild(row);

  box.scrollTop = box.scrollHeight;
}

/* ================= Init ================= */

loadChats();
