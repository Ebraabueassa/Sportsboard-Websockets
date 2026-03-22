import express from 'express';
import { matchRouter } from './routes/matches.js';
import { commentaryRouter } from './routes/commentary.js';
import http from 'http';
import { attachWebsocketServer } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';

const app = express();
const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Hello! Welcome to the server.' });
});

app.use(securityMiddleware());

app.use('/matches', matchRouter);
app.use('/matches/:id/commentary', commentaryRouter);

const { broadcastMatchCreated, broadcastCommentary } = attachWebsocketServer(server);  // fixed casing
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;  // fixed: roadcastcommentary -> broadcastCommentary

server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0'
        ? `http://localhost:${PORT}`
        : `http://${HOST}:${PORT}`;

    console.log(`Server is running on ${baseUrl}`);
    console.log(`Websocket Server is running on ${baseUrl.replace('http', 'ws')}/ws`);
});