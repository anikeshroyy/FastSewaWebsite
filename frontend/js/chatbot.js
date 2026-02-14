// --- CONFIGURATION ---
const API = "https://fastsewabackend-production.up.railway.app/api";

const servicePrompts = {
    construction: "I want construction",
    security: "Need security guard",
    medical: "I need a doctor",
    legal: "Legal help",
    land: "Land verification",
    finance: "Finance assistant",
    repair: "I need repair services",
    material: "I need construction material"
};

// --- UI HELPERS ---
function addMsg(text, type) {
    const chatBody = document.getElementById("chatBody");
    if (!chatBody) return;

    const div = document.createElement("div");
    div.className =
        "fastsewa-message " +
        (type === "bot" ? "fastsewa-bot-message" : "fastsewa-user-message");

    div.innerHTML = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function initChat() {
    const chatBody = document.getElementById("chatBody");
    if (!chatBody || chatBody.innerHTML.trim() !== "") return;

    addMsg("👋 <b>Namaste!</b> Welcome to FastSewa. Select a service:", "bot");

    addMsg(`
      <div class="service-buttons">
        <button class="service-btn" onclick="sendMessage('construction')">🏗 Construction</button>
        <button class="service-btn" onclick="sendMessage('security')">🛡 Security</button>
        <button class="service-btn" onclick="sendMessage('medical')">🩺 Medical</button>
        <button class="service-btn" onclick="sendMessage('legal')">⚖ Legal & GST</button>
        <button class="service-btn" onclick="sendMessage('land')">🗺 Land Verify</button>
        <button class="service-btn" onclick="sendMessage('finance')">💰 Finance</button>
        <button class="service-btn" onclick="sendMessage('repair')">🔧 Repairs</button>
        <button class="service-btn" onclick="sendMessage('material')">🚚 Material</button>
      </div>
    `, "bot");
}

// --- SEND MESSAGE ---
async function sendMessage(key) {
    const input = document.getElementById("chatInput");
    if (!input) return;

    const msg =
        key && servicePrompts[key]
            ? servicePrompts[key]
            : input.value.trim();

    if (!msg) return;

    addMsg(msg, "user");
    input.value = "";

    try {
        const res = await fetch(`${API}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg })
        });

        const data = await res.json();
        addMsg(data.response || "Sorry, I didn’t understand.", "bot");

        if (data.pdf_generated && data.pdf_file) {
            addMsg(
                `<a target="_blank"
                    href="${API}/download-pdf/${data.pdf_file}"
                    style="background:#10b981;color:#fff;padding:8px 14px;border-radius:20px;display:inline-block;margin-top:6px;">
                    📄 Download Estimate PDF
                </a>`,
                "bot"
            );
        }
    } catch {
        addMsg("⚠️ Server busy. Call +91 8275723755", "bot");
    }
}

// --- INITIALIZER (IMPORTANT) ---
function initChatbot() {
    const chatbox = document.getElementById("chatbox");
    const toggleBtn = document.getElementById("toggleBtn");
    const closeBtn = document.getElementById("closeBtn");
    const sendBtn = document.getElementById("sendBtn");
    const input = document.getElementById("chatInput");

    if (!toggleBtn || !chatbox) return;

    toggleBtn.onclick = () => {
        const hidden =
            chatbox.style.display === "" ||
            chatbox.style.display === "none";

        chatbox.style.display = hidden ? "flex" : "none";
        if (hidden) initChat();
    };

    if (closeBtn) closeBtn.onclick = () => (chatbox.style.display = "none");
    if (sendBtn) sendBtn.onclick = () => sendMessage();
    if (input)
        input.onkeypress = e => {
            if (e.key === "Enter") sendMessage();
        };
}

// expose globally so index.html can call it
window.initChatbot = initChatbot;
