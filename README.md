# Chat-Bot

A private AI chat website featuring a customizable fictional ex-girlfriend character called **EX GF**. The chatbot uses Gemini through a small Node.js server and provides a playful Hinglish conversation experience.

## Features

- Gemini-powered chat responses
- Custom character name
- Custom character instructions
- Female, male, and non-binary chatbot options
- Multiple visual themes
- Personal Gemini API key support
- Delete conversation memory and start fresh
- Responsive chat interface
- API key kept on the server or sent only when explicitly configured in Settings

## Requirements

- Node.js 18 or newer
- A valid Gemini API key

## Setup

From the `Chat-Bot` folder, install dependencies:

```powershell
npm install
```

Create a `.env` file in this folder:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3010
```

Never commit `.env` or share your API key. The repository ignores `.env` automatically.

## Run Locally

```powershell
npm start
```

Open the website at:

```text
http://localhost:3010
```

## Project Structure

```text
Chat-Bot/
├── EX.js
├── package.json
├── .env
└── public-ex/
    ├── index.html
    ├── app.js
    └── styles.css
```

## Settings

Open the gear button in the header to change the character name, personality instructions, gender, theme, or personal Gemini API key. Settings are stored in the browser's local storage.

The server keeps conversation context in memory. Use **Delete history** to clear it and start a fresh conversation.

## Note

This project is intended for learning and personal use. Add proper authentication, rate limiting, and server-side user storage before using it in production.
