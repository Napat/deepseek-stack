// MathJax Configuration
window.MathJax = {
    tex: {
        inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
        ],
        displayMath: [
            ["$$", "$$"],
            ["\\[", "\\]"],
        ],
        processEscapes: true,
    },
    svg: {
        fontCache: "global",
    },
    options: {
        skipHtmlTags: ["script", "noscript", "style", "textarea", "pre"],
    },
};

// Theme Management
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem("theme") || "dark";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
}

// Chat Functions
let chatHistory = [];

function saveChatHistory() {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function loadChatHistory() {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
        chatHistory = JSON.parse(saved);
        chatHistory.forEach((msg) => {
            addMessage(msg.content, msg.isUser, false, msg.timestamp);
        });
    }
}

function clearChat() {
    if (confirm("Are you sure you want to clear the chat history?")) {
        chatHistory = [];
        saveChatHistory();
        document.getElementById("chatContainer").innerHTML = "";
    }
}

function exportChat() {
    const dataStr = JSON.stringify(chatHistory, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function importChat(event) {
    const file = event.target.files[0];
    if (file) {
        try {
            const text = await file.text();
            const imported = JSON.parse(text);
            if (Array.isArray(imported)) {
                chatHistory = imported;
                document.getElementById("chatContainer").innerHTML = "";
                loadChatHistory();
                saveChatHistory();
            }
        } catch (error) {
            alert("Error importing chat history: " + error.message);
        }
    }
}

// เพิ่มฟังก์ชันใหม่สำหรับ smooth scroll
function scrollToBottom(element, smooth = true) {
    const scrollHeight = element.scrollHeight;
    if (smooth) {
        element.scrollTo({
            top: scrollHeight,
            behavior: "smooth",
        });
    } else {
        element.scrollTop = scrollHeight;
    }
}

function formatTimestamp(date) {
    return new Date(date).toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function addMessage(
    content,
    isUser = false,
    save = true,
    timestamp = new Date().toISOString()
) {
    const chatContainer = document.getElementById("chatContainer");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user-message" : "ai-message"}`;

    // สร้าง wrapper สำหรับเนื้อหาข้อความ
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.innerHTML = content;

    // สร้าง element สำหรับแสดงเวลา
    const timeDiv = document.createElement("div");
    timeDiv.className = "message-timestamp";
    timeDiv.textContent = formatTimestamp(timestamp);

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    chatContainer.appendChild(messageDiv);

    // Render math equations
    MathJax.typesetPromise([contentDiv]).catch((err) => {
        console.error("MathJax error:", err);
    });

    scrollToBottom(chatContainer, !isUser);

    if (save) {
        chatHistory.push({ content, isUser, timestamp });
        saveChatHistory();
    }

    return messageDiv;
}

async function loadAvailableModels() {
    try {
        const response = await fetch("http://localhost:11434/api/tags");
        const data = await response.json();
        const modelSelect = document.getElementById("modelSelect");

        modelSelect.innerHTML = "";

        if (!data.models || data.models.length === 0) {
            modelSelect.innerHTML =
                '<option value="">No models installed</option>';
            addMessage(
                "⚠️ No AI models are currently installed. Please install at least one model to use the chat.",
                false
            );
            return;
        }

        data.models.forEach((model) => {
            const option = document.createElement("option");
            option.value = model.name;
            option.textContent = `${model.name} (${model.details.parameter_size})`;
            modelSelect.appendChild(option);
        });

        modelSelect.disabled = false;
    } catch (error) {
        console.error("Error loading models:", error);
        const modelSelect = document.getElementById("modelSelect");
        modelSelect.innerHTML =
            '<option value="">Error loading models</option>';
        addMessage(
            "⚠️ Error connecting to the AI server. Please make sure the server is running.",
            false
        );
    }
}

function cleanupText(text) {
    // ลบ line breaks ที่ซ้ำซ้อน
    return text
        .replace(/\n\s*\n\s*\n/g, "\n\n") // แทนที่ 3 บรรทัดว่างหรือมากกว่าด้วย 2 บรรทัด
        .replace(/^\s+|\s+$/g, ""); // ตัดช่องว่างหัวท้าย
}

async function askAI() {
    const question = document.getElementById("question").value;
    if (!question.trim()) return;

    const questionTime = new Date().toISOString();
    addMessage(question, true, true, questionTime);
    document.getElementById("question").value = "";

    const thinkingDiv = addMessage("Thinking...", false, false);

    try {
        const response = await fetch("http://127.0.0.1:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: document.getElementById("modelSelect").value,
                prompt: question,
                stream: false,
            }),
        });

        const data = await response.json();
        const responseTime = new Date().toISOString();
        thinkingDiv.remove(); // ลบข้อความ thinking

        const cleanedResponse = cleanupText(data.response);
        const messageDiv = addMessage(
            cleanedResponse,
            false,
            true,
            responseTime
        );

        // ให้แน่ใจว่า MathJax render หลังจากเพิ่มข้อความ
        await MathJax.typesetPromise([messageDiv]);
        scrollToBottom(document.getElementById("chatContainer"), true);
    } catch (error) {
        thinkingDiv.innerHTML = `Error: ${error.message}`;
        chatHistory.push({ content: `Error: ${error.message}`, isUser: false });
        saveChatHistory();
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadAvailableModels();
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    loadChatHistory();
});
