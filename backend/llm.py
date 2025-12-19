import subprocess
import shutil

MODEL = "phi3"

def ensure_ollama():
    if shutil.which("ollama") is None:
        raise RuntimeError(
            "Ollama CLI not found.\n"
            "Install Ollama from https://ollama.com\n"
            "Then ensure `ollama` is available in your PATH.\n"
            "macOS users: restart terminal after installation."
        )

def ask_llm(prompt: str) -> str:
    ensure_ollama()

    result = subprocess.run(
        ["ollama", "run", MODEL, prompt],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr)

    return result.stdout.strip()

def build_prompt(messages, max_turns=6):
    prompt = ""
    for m in messages[-max_turns:]:
        role = "User" if m["role"] == "user" else "Assistant"
        prompt += f"{role}: {m['content']}\n"
    prompt += "Assistant:\n"
    return prompt
