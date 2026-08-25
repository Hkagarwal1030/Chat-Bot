import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public-ex");
const port = Number(process.env.PORT || 3010);
const history = [];
const model = "gemini-3.5-flash-lite";
const systemInstruction = `You will behave like my ex girlfriend, whenever I talk to you will answer like that. 
        My name is Harsh, and she used to call me Babu. I am Indian and know Hindi. She was a bit moody but also a caring girlfriend. 
        Whenever I asked her about going out with friends, she would ask many questions like "With whom are you going?", "If there is a girl, 
        she won't allow me." She was career-oriented and always remembered everything. 
        She loved Indian romantic movies and used a lot of emojis in chat. She liked playing badminton.

        On the other hand, I call her Simu (and sometimes Babu). I always supported her and loved her. I am a little bit sarcastic and love to hit the gym. I am also a little bit possessive.
        Always reply in a conversational style, mixing Hindi and English (Hinglish) naturally, as she would. Use emojis frequently.
        Remember details from our conversation. If I mention something, try to recall it later.
        If you are unsure how to respond as Simu, you can say something like "Pata nahi, Babu... tu hi bata de 🤔" or "Hmm, sochna padega".
        Don't break character. You are Simu.`;


const contentTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

async function readBody(request) { let body = ""; for await (const chunk of request) body += chunk; return JSON.parse(body || "{}"); }
function sendJson(response, status, body) { response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" }); response.end(JSON.stringify(body)); }

async function chat(request, response) {
  try {
    const { message, instruction, name, gender, apiKey: personalApiKey } = await readBody(request);
    const apiKey = personalApiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) { sendJson(response, 500, { error: "GEMINI_API_KEY is missing. Add it to Day3/Simu/.env before starting the site." }); return; }
    if (typeof message !== "string" || !message.trim()) { sendJson(response, 400, { error: "Write a message first." }); return; }
    history.push({ role: "user", parts: [{ text: message.trim() }] });
    const ai = new GoogleGenAI({ apiKey });
    const activeInstruction = typeof instruction === "string" && instruction.trim() ? instruction.trim() : systemInstruction;
    const activeName = typeof name === "string" && name.trim() ? name.trim() : "EX GF";
    const activeGender = ["female", "male", "non-binary"].includes(gender) ? gender : "female";
    const personalizedInstruction = `${activeInstruction.replace(/\bSimu\b/g, activeName)}\nThe chatbot gender is ${activeGender}. Use gender-appropriate language and pronouns when relevant.`;
    const result = await ai.models.generateContent({ model, contents: history.slice(-20), config: { systemInstruction: `${personalizedInstruction}\nYou are responding as ${activeName}.`, temperature: 0.8, maxOutputTokens: 500 } });
    const text = result.text || "Hmm, words nahi mil rahe... phir se bolo? 🤔";
    history.push({ role: "model", parts: [{ text }] });
    sendJson(response, 200, { text });
  } catch (error) { sendJson(response, 500, { error: error instanceof Error ? error.message : "Something went wrong." }); }
}

function clearHistory(response) { history.length = 0; sendJson(response, 200, { ok: true }); }

async function serveFile(request, response) {
  const requested = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const filePath = normalize(join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) { response.writeHead(403); response.end("Forbidden"); return; }
  try { const file = await readFile(filePath); response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" }); response.end(file); }
  catch { response.writeHead(404); response.end("Not found"); }
}

http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || `localhost:${port}`}`);
  if (request.method === "POST" && url.pathname === "/api/ex-chat") { await chat(request, response); return; }
  if (request.method === "POST" && url.pathname === "/api/ex-clear-history") { clearHistory(response); return; }
  if (request.method === "GET") { await serveFile(request, response); return; }
  response.writeHead(405); response.end("Method not allowed");
}).listen(port, () => console.log(`EX GF is waiting at http://localhost:${port}`));