# Spotz ⚽

A real-time sports commentary and match tracking platform built with Node.js, WebSockets, and Drizzle ORM.

## Features

- **REST API** — Create and list matches with full validation
- **Real-time WebSockets** — Live match commentary broadcast to subscribed clients
- **Match Subscriptions** — Clients can subscribe/unsubscribe to specific matches
- **Rate Limiting & Security** — Bot detection and rate limiting via Arcjet
- **Database** — PostgreSQL with Drizzle ORM for type-safe queries

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express.js
- **WebSockets** — ws
- **Database** — PostgreSQL + Drizzle ORM
- **Security** — Arcjet (rate limiting, bot detection, shield)
- **Validation** — Zod

## Project Structure

```
src/
├── db/
│   ├── db.js           # Database connection
│   └── schema.js       # Drizzle schema
├── routes/
│   ├── matches.js      # Match REST API
│   └── commentary.js   # Commentary REST API
├── utils/
│   └── match-status.js # Match status helper
├── validation/
│   └── matches.js      # Zod schemas
├── ws/
│   └── server.js       # WebSocket server
├── arcjet.js           # Security config
└── index.js            # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
git clone https://github.com/yourusername/spotz.git
cd spotz
npm install
```

### Environment Variables

Create a `.env` file in the root of the project:

```env
PORT=8000
HOST=0.0.0.0
DATABASE_URL="postgresql://neondb_owner:npg_0mpnRcGC8TrP@ep-jolly-butterfly-adl1rukl-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
ARCJET_KEY="ajkey_01km9m7j2yfpyvx6zwj5byv7n7"
ARCJET_MODE=LIVE
```

### Run the development server

```bash
npm run dev
```

Server will be running at `http://localhost:8000`
WebSocket server will be running at `ws://localhost:8000/ws`

## API Endpoints

### Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matches` | List all matches |
| POST | `/matches` | Create a new match |

#### Create a Match

```http
POST /matches
Content-Type: application/json

{
  "sport": "football",
  "homeTeam": "Manchester City",
  "awayTeam": "JSM United",
  "startTime": "2026-02-01T12:00:00.000Z",
  "endTime": "2026-02-01T13:45:00.000Z"
}
```

### Commentary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matches/:id/commentary` | List commentary for a match |
| POST | `/matches/:id/commentary` | Add commentary to a match |

#### Add Commentary

```http
POST /matches/1/commentary
Content-Type: application/json

{
  "minute": 42,
  "sequence": 120,
  "period": "2nd half",
  "eventType": "goal",
  "actor": "Alex Morgan",
  "team": "FC Neon",
  "message": "GOAL! Powerful finish from the edge of the box.",
  "metadata": { "assist": "Sam Kerr" },
  "tags": ["goal", "shot"]
}
```

## WebSocket Usage

Connect to the WebSocket server:

```bash
wscat -c ws://localhost:8000/ws
```

### Messages

**Subscribe to a match:**
```json
{ "type": "subscribe", "matchId": 1 }
```

**Unsubscribe from a match:**
```json
{ "type": "unsubscribe", "matchId": 1 }
```

### Events received from server

| Type | Description |
|------|-------------|
| `welcome` | Sent on connection |
| `subscribed` | Confirmed match subscription |
| `unsubscribed` | Confirmed match unsubscription |
| `match_created` | Broadcast when a new match is created |
| `commentary` | Broadcast when commentary is added to a subscribed match |

## Security

This project uses [Arcjet](https://arcjet.com) for:
- **Shield** — Protection against common attacks
- **Bot Detection** — Blocks malicious bots while allowing search engines
- **Rate Limiting** — 50 requests per 10s for HTTP, 5 connections per 2s for WebSockets
