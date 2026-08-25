const messages = document.querySelector("#messages");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const clearButton = document.querySelector("#clearChat");
const settingsBackdrop = document.querySelector("#settingsBackdrop");
const settingsForm = document.querySelector("#settingsForm");
const nameSetting = document.querySelector("#nameSetting");
const instructionSetting = document.querySelector("#instructionSetting");
const keySetting = document.querySelector("#keySetting");
const themeSetting = document.querySelector("#themeSetting");
const genderSetting = document.querySelector("#genderSetting");
const settingsStatus = document.querySelector("#settingsStatus");
const defaultInstruction = `You are EX GF, Harsh's fictional ex-girlfriend character. You used to call him Babu. You are caring, witty, sarcastic, career-minded, and enjoy kabaddi and learning new things. Speak naturally in Hinglish with occasional emojis. Remember conversation details, use playful harmless teasing, respect boundaries, stay fictional, and keep replies concise.`;
const hasSavedSettings = Boolean(localStorage.getItem("simu-settings"));
let settings = { name: "EX GF", instruction: defaultInstruction, theme: "rose", apiKey: "", gender: "female" };
const themes = ["rose", "violet", "midnight", "ocean", "forest", "sunset", "mono", "light"];
try { settings = { ...settings, ...(JSON.parse(localStorage.getItem("simu-settings") || "null") || {}) }; } catch { localStorage.removeItem("simu-settings"); }
if (settings.name === "Simu") settings.name = "EX GF";
if (typeof settings.instruction !== "string") settings.instruction = defaultInstruction;
settings.instruction = settings.instruction.replace(/\bSimu\b/g, "EX GF");
if (!themes.includes(settings.theme)) settings.theme = "rose";

function applySettings() {
  document.querySelector("#simuName").textContent = settings.name;
  document.querySelector("#avatar").firstChild.textContent = settings.name.charAt(0).toUpperCase();
  document.querySelector("#memoryLabel").textContent = `${settings.name.toUpperCase()}'S NOTE`;
  input.placeholder = `Message ${settings.name}...`;
  input.setAttribute("aria-label", `Message ${settings.name}`);
  document.body.dataset.theme = settings.theme;
  document.title = `Chat with ${settings.name}`;
}
function openSettings() { nameSetting.value = settings.name; instructionSetting.value = settings.instruction; keySetting.value = settings.apiKey; genderSetting.value = settings.gender; themeSetting.value = settings.theme; settingsStatus.textContent = ""; settingsBackdrop.hidden = false; nameSetting.focus(); }
function closeSettings() { settingsBackdrop.hidden = true; }

function addMessage(text, role, temporary = false) {
  const message = document.createElement("article");
  message.className = `message ${role}${temporary ? " typing" : ""}`;
  message.innerHTML = `<p>${escapeHtml(text)}</p>${temporary ? "" : `<time>${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>`}`;
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

function escapeHtml(text) { return text.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }

async function sendMessage(event) {
  event.preventDefault();
  const text = input.value.trim();
  if (!text || sendButton.disabled) return;
  addMessage(text, "user");
  input.value = "";
  sendButton.disabled = true;
  const typing = addMessage(`${settings.name} is typing`, "bot", true);
  try {
    const response = await fetch("/api/ex-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, instruction: settings.instruction, name: settings.name, gender: settings.gender, apiKey: settings.apiKey }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not reach EX GF.");
    typing.remove();
    addMessage(data.text, "bot");
  } catch (error) {
    typing.remove();
    addMessage(`Bubu, connection mein thodi problem hai. ${error.message}`, "bot");
  } finally { sendButton.disabled = false; input.focus(); }
}


async function startFresh() {
  messages.innerHTML = "";
  input.value = "";
  addMessage(`Fresh start, bubu. ${settings.name} is here. 😊`, "bot");
  try {
    const response = await fetch("/api/ex-clear-history", { method: "POST" });
    if (!response.ok) throw new Error("Could not clear server memory.");
    return true;
  } catch (error) {
    addMessage(`The screen is fresh, but server memory could not be cleared. ${error.message}`, "bot");
    return false;
  }
}
form.addEventListener("submit", sendMessage);
input.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); form.requestSubmit(); } });
clearButton.addEventListener("click", () => { startFresh(); input.focus(); });
document.querySelector("#settingsButton").addEventListener("click", openSettings);
document.querySelector("#closeSettings").addEventListener("click", closeSettings);
settingsBackdrop.addEventListener("click", (event) => { if (event.target === settingsBackdrop) closeSettings(); });
settingsForm.addEventListener("submit", (event) => { event.preventDefault(); settings.name = nameSetting.value.trim() || "EX GF"; settings.instruction = instructionSetting.value.trim() || defaultInstruction; settings.apiKey = keySetting.value.trim(); settings.gender = genderSetting.value; settings.theme = themes.includes(themeSetting.value) ? themeSetting.value : "rose"; localStorage.setItem("simu-settings", JSON.stringify(settings)); applySettings(); settingsStatus.textContent = "Settings saved."; });
document.querySelector("#deleteHistory").addEventListener("click", async () => { if (!window.confirm("Delete all conversation memory and start fresh?")) return; const cleared = await startFresh(); settingsStatus.textContent = cleared ? "All conversation memory deleted." : "Visible conversation cleared, but server memory could not be cleared."; });
applySettings();
if (!hasSavedSettings) { openSettings(); settingsStatus.textContent = "Make your first character profile before you start chatting."; }
input.focus();
