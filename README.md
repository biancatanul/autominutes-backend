# AutoMinutes - Backend

REST API for the AutoMinutes meeting management app. Handles meetings, attendees, action items, transcript storage, and AI-powered transcript processing.

## Tech Stack

- NestJS + TypeScript
- MongoDB Atlas (Mongoose)
- class-validator / class-transformer
- Swagger (`@nestjs/swagger`)
- Ollama (llama3.1) for LLM transcript processing

## Setup

```bash
git clone https://github.com/biancatanul/autominutes-backend.git
cd autominutes-backend
npm install
```

Create a `.env` file in the project root:

```
PORT=3500
MONGO_URI=your_mongo_connection_string_here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

Make sure Ollama is running locally with the model pulled before triggering AI processing:

```bash
ollama pull llama3.1
```

If you installed the Ollama desktop app, it runs in the background automatically, no need to start it manually. Check it's up by opening `http://localhost:11434` in a browser, you should see "Ollama is running".

## Running the app

```bash
npm run start:dev
```

Server runs at `http://localhost:3500`. Swagger docs available at `http://localhost:3500/docs`.
