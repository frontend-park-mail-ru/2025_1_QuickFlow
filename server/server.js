'use strict';

import express from 'express';
import body from 'body-parser';
import cookie from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import crypto from 'crypto';

import http from 'http';
import { WebSocketServer } from 'ws';

import { users, posts, chats, messages, search } from '../public/mocks.ts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/api/ws' });

const ids = {};





wss.on('connection', (ws) => {
    console.log('[WS] Client connected');

    ws.on('message', (data) => {
        try {
            console.log(data);
            const { type, payload } = JSON.parse(data);
            console.log(`[WS] Message received:`, type, payload);

            const response = {
                type: 'message',
                payload: {
                    id: "uuidv4()",
                    text: "hello!",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_read: false,
                    attachment_urls: null,
                    sender: {
                        id: "1eabe150-7b9e-42b3-a8d5-ad6ad900180c",
                        username: "Nikita2",
                        firstname: "Myname",
                        lastname: "Mysurname"
                    },
                    chat_id: "99f9d7dd-e955-4eda-97ec-91c958208b3b"
                }
            };

            ws.send(JSON.stringify(response));
        } catch (err) {
            console.error('[WS] Failed to parse message', data);
        }
    });

    ws.on('close', () => {
        console.log('[WS] Client disconnected');
    });
});







app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(express.static(path.resolve(__dirname, 'images')));
app.use('/static', express.static('static'));
app.use(body.json());
app.use(cookie());

app.post('/api/signup', (req, res) => {
    const password = req.body.password;
    const email = req.body.email;
    const age = req.body.age;
    if (
        !password ||
        !email ||
        !age ||
        !password.match(/^\S{4,}$/) ||
        !email.match(/@/) ||
        !(typeof age === 'number' && age > 10 && age < 100)
    ) {
        return res.status(400).json({ error: 'Не валидные данные пользователя' });
    }
    if (users[email]) {
        return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const id = crypto.randomUUID();
    const user = { password, email, age, images: [] };
    ids[id] = email;
    users[email] = user;

    res.cookie('podvorot', id, {
        expires: new Date(Date.now() + 10000 * 60 * 10),
        httpOnly: true
    });
    res.status(201).json({ id });
});

app.post('/api/login', (req, res) => {
    const password = req.body.password;
    const username = req.body.username;
    if (!password || !username) {
        return res.status(400).json({ error: 'Не указано имя пользователя или пароль' });
    }
    if (!users[username] || users[username].profile.password !== password) {
        return res.status(400).json({ error: 'Неверное имя пользователя или пароль' });
    }

    const id = crypto.randomUUID();
    ids[id] = username;

    res.cookie('podvorot', id, {
        expires: new Date(Date.now() + 10000 * 60 * 10),
        httpOnly: true
    });
    res.status(200).json({ id });
});

app.post('/api/logout', (req, res) => {
    const id = req.cookies['podvorot'];
    
    if (!id) {
        return res.status(400).end();
    }

    delete ids[id];
    res.clearCookie('podvorot');

    res.status(200).end();
});

app.get('/api/feed', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).json(posts);
});

app.get('/api/users/search', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }

    const string = req.query.string;
    if (!string) {
        return res.status(400).end();
    }

    res.status(200).json(search);
});

app.get('/api/profiles/:username', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }

    const queryUsername = req.params.username;
    if (!queryUsername) {
        return res.status(400).end();
    } else if (!users[queryUsername]) {
        return res.status(404).end();
    }

    res.status(200).json(users[queryUsername]);
});

app.post('/api/profile', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }
    // TODO: добавить логику обновления данных
    res.status(200).end();
});

app.get('/api/chats', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }
    
    res.status(200).json(chats[username]);
});

app.get('/api/chats/:chat_id/messages', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }

    if (!req.params || !req.params.chat_id || !req.query || !req.query.messages_count) {
        return res.status(400).end();
    }

    const chatId = req.params.chat_id;
    if (!messages[username][chatId]) {
        return res.status(404).end();
    }

    return res.status(200).json(messages[username][chatId]);
});

app.post('/api/messages/:username', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }

    res.status(200).json({
        id: "9a00f4b4-7914-4a3e-91be-c5a7b51bc609",
        text: "Новое сообщение",
        created_at: "2025-04-10T19:08:42.323841+03:00",
        updated_at: "2025-04-10T19:08:42.323841+03:00",
        is_read: false,
        attachment_urls: null,
        "sender": {
            "id": "0e146b4b-b28e-44b8-8c59-f0c182459756",
            "username": "rvasutenko",
            "firstname": "Роман",
            "lastname": "Васютенко",
            "avatar_url": "/avatars/avatar.jpg",
        },
        chat_id: "c828ab93-88dd-4855-a309-940b064e9011"
    });
});

const port = process.env.PORT || 3000;

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});



// app.listen(port, function () {
//     console.log(`Server listening port ${port}`);
// });

server.listen(port, function () {
    console.log(`Server listening port ${port}`);
});
