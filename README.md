# AutoMinutes — Backend

REST API for the AutoMinutes meeting management app. Handles auth, meetings, attendees, action items, transcript storage/versioning, and AI-powered transcript processing.

## Tech Stack

- NestJS + TypeScript
- MongoDB Atlas (Mongoose)
- `@nestjs/jwt` + `passport-jwt` + bcrypt (auth)
- class-validator / class-transformer
- chrono-node (deterministic deadline parsing from LLM output)
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
JWT_SECRET=replace-this-with-a-long-random-string
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

Server runs at `http://localhost:3500`. All routes are prefixed with `/api` (global prefix set in `main.ts`). Swagger docs available at `http://localhost:3500/docs`.

CORS is currently locked to `http://localhost:5173` (the frontend dev server).

## API Overview

All paths below are relative to `/api`.

| Resource | Endpoints |
| --- | --- |
| Auth | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`, `PATCH /auth/me`, `PATCH /auth/me/password` |
| Meetings | `POST /meetings`, `GET /meetings`, `GET /meetings/:id`, `PATCH /meetings/:id`, `DELETE /meetings/:id` |
| Transcripts | `POST /meetings/:id/transcript`, `PUT /meetings/:id/transcript`, `GET /meetings/:id/transcript`, `GET /meetings/:id/transcript/versions`, `GET /meetings/:id/transcript/versions/:v/download` |
| Processing | `POST /meetings/:id/process` |
| AI Results | `GET /meetings/:id/results` |
| Attendees | `POST /attendees`, `GET /attendees`, `GET /attendees/:id`, `PATCH /attendees/:id`, `DELETE /attendees/:id` |
| Action Items | `POST /action-items`, `GET /action-items`, `GET /action-items/:id`, `PATCH /action-items/:id`, `DELETE /action-items/:id` |

Auth: all routes except `signup`/`login` expect a `Bearer` JWT. Meetings are currently shared across authenticated users (no per-user ownership filtering), that's a deliberate design choice, not an oversight, since it's not required by the spec.

## Project Structure

```
src/
  auth/           # JWT auth, guards, strategies, signup/login/me
  users/
  meetings/
  attendees/
  transcripts/     # storage + versioning
  processing/      # triggers LLM processing
  llm/             # Ollama integration, prompt construction
  ai-results/      # stores/retrieves structured AI output per meeting
  action-items/
  common/          # global exception filter, shared pipes/decorators
  app/             # AppModule, root controller
  main.ts
```

## Validation & Error Handling

- Global `ValidationPipe` with `whitelist`, `transform`, and `forbidNonWhitelisted` enabled.
- Centralized exception filter (`AllExceptionsFilter`) so no raw stack traces reach the client.
