'use strict';

import express from 'express';
import body from 'body-parser';
import cookie from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import crypto from 'crypto';

import http from 'http';
import { WebSocketServer } from 'ws';

import { users, posts, chats, messages, search, community, post, comments, unread, stickerPacks } from '../public/mocks.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/api/ws' });

const ids = {};





wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        try {
            console.log(data);
            const { type, payload } = JSON.parse(data);
            console.log(`[WS] Message received:`, type, payload);

            // const response = {
            //     type: 'message',
            //     payload: {
            //         id: 'uuidv4()',
            //         text: "hello!",
            //         created_at: new Date().toISOString(),
            //         updated_at: new Date().toISOString(),
            //         sender: {
            //             id: "1eabe150-7b9e-42b3-a8d5-ad6ad900180c",
            //             username: "Nikita2",
            //             firstname: "Myname",
            //             lastname: "Mysurname"
            //         },
            //         chat_id: "49dc794b-d8cf-404c-be69-4886bd78ada4"
            //     }
            // };

            // ws.send(JSON.stringify(response));
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

let counter = 1;
app.get('/api/feed', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    posts.forEach((post) => {
        post.id = crypto.randomUUID();
        post.text = counter;
        counter++;
    });

    res.status(200).json(posts);
});

app.get('/api/sticker_packs', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).json(stickerPacks);
});

app.get('/api/profiles/:username/posts', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).json(posts);
});

app.get('/api/posts/:post_id', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).json(post);
});

app.get('/api/communities/:address/posts', (req, res) => {
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

app.get('/api/my_profile', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).json(users['rvasutenko']);
});

app.get('/api/posts/:post_id/comments', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).json(comments);
});

app.get('/api/chats/unread', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).json(unread);
});

app.post('/api/posts/:post_id/comment', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    const comment = comments[0];
    comment.text = req.body.text;

    res.status(200).json(comment);
});

app.put('/api/comments/:comment_id', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    const comment = comments[0];
    comment.text = req.body.text;

    res.status(200).json(comment);
});

app.delete('/api/comments/:comment_id', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).end();
});

app.post('/api/comments/:comment_id/like', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).end();
});

app.delete('/api/comments/:comment_id/like', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).end();
});

app.get('/api/communities/:pk', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }

    const pk = req.params.pk;
    if (!pk) {
        return res.status(400).end();
    }

    res.status(200).json(community);
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

app.post('/api/posts/:post_id/like', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }
    
    res.status(204).end();
});

app.delete('/api/posts/:post_id/like', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }
    
    res.status(204).end();
});

app.get('/api/friends', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }
    
    res.status(200).json({
        "payload": {
            "friends": [
                {
                    "id": "210a4267-d183-4aee-aaae-06eb6e8c5b24",
                    "username": "1212121edwddwdwd____",
                    "firstname": "mmmmmmmmmmmmmmmmmmmm-m",
                    "lastname": "mmmmmmmmmmmmmmmmmmmm-mmmm",
                    "avatar_url": "https://quickflowapp.ru/minio/posts/5584e4f1-4920-4cff-bbf5-c01b3d4627d3.jpg",
                    "university": "ауауауауауауауауауауауауауауауауауауауауауауауауау",
                    "is_online": false
                },
                {
                    "id": "76682f88-4cf8-4394-bb7e-8a355591cd80",
                    "username": "Timex",
                    "firstname": "Матвей",
                    "lastname": "Митрофанов",
                    "avatar_url": "https://quickflowapp.ru/minio/posts/0a74b5e0-ed7d-4985-aaf5-0f8bd28ababb.gif",
                    "university": "ПТУ Баумана",
                    "is_online": false
                },
                {
                    "id": "846ccb16-f2cc-4d69-a440-7c3149b43227",
                    "username": "Nikita",
                    "firstname": "Никита",
                    "lastname": "Могилин",
                    "avatar_url": "https://quickflowapp.ru/minio/posts/116dd43b-f3f8-47e1-a9f1-e3c8e96e939b.jpg",
                    "university": "asdf",
                    "is_online": false
                },
                {
                    "id": "0ae4ea44-f654-4f9f-8840-b6741b49f8e4",
                    "username": "Roman",
                    "firstname": "Роман",
                    "lastname": "Павловский",
                    "avatar_url": "https://quickflowapp.ru/minio/posts/cbb1a62a-93ca-4a67-9a68-4741c2ec655e.jpg",
                    "university": "",
                    "is_online": false
                },
                {
                    "id": "08024478-4f49-43f6-b620-a99308741ca9",
                    "username": "lilysha",
                    "firstname": "Жужужужужужу",
                    "lastname": "Сусликовн",
                    "avatar_url": "",
                    "university": "",
                    "is_online": false
                },
                {
                    "id": "dd9b9b3b-ac29-4798-a915-174f5ef35681",
                    "username": "lilysha.yyyyyyyyyyuu",
                    "firstname": "Николетта",
                    "lastname": "ЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩ",
                    "avatar_url": "https://quickflowapp.ru/minio/posts/155a4e44-e350-416a-a32b-087f434d294a.jpeg",
                    "university": "",
                    "is_online": false
                }
            ],
            "total_count": 6
        }
    });
});

app.get('/api/communities/:id/members', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }
    
    res.status(200).json({
        "body": {
            "friends": [
                {
                    "id": "210a4267-d183-4aee-aaae-06eb6e8c5b24",
                    "username": "1212121edwddwdwd____",
                    "firstname": "mmmmmmmmmmmmmmmmmmmm-m",
                    "lastname": "mmmmmmmmmmmmmmmmmmmm-mmmm",
                    "avatar_url": "https://quickflowapp.ru/minio/posts/5584e4f1-4920-4cff-bbf5-c01b3d4627d3.jpg",
                    "university": "ауауауауауауауауауауауауауауауауауауауауауауауауау",
                    "is_online": false
                },
                {
                    "id": "76682f88-4cf8-4394-bb7e-8a355591cd80",
                    "username": "Timex",
                    "firstname": "Матвей",
                    "lastname": "Митрофанов",
                    "avatar_url": "https://quickflowapp.ru/minio/posts/0a74b5e0-ed7d-4985-aaf5-0f8bd28ababb.gif",
                    "university": "ПТУ Баумана",
                    "is_online": false
                },
                {
                    "id": "846ccb16-f2cc-4d69-a440-7c3149b43227",
                    "username": "Nikita",
                    "firstname": "Никита",
                    "lastname": "Могилин",
                    "avatar_url": "https://quickflowapp.ru/minio/posts/116dd43b-f3f8-47e1-a9f1-e3c8e96e939b.jpg",
                    "university": "asdf",
                    "is_online": false
                },
                {
                    "id": "0ae4ea44-f654-4f9f-8840-b6741b49f8e4",
                    "username": "Roman",
                    "firstname": "Роман",
                    "lastname": "Павловский",
                    "avatar_url": "https://quickflowapp.ru/minio/posts/cbb1a62a-93ca-4a67-9a68-4741c2ec655e.jpg",
                    "university": "",
                    "is_online": false
                },
                {
                    "id": "08024478-4f49-43f6-b620-a99308741ca9",
                    "username": "lilysha",
                    "firstname": "Жужужужужужу",
                    "lastname": "Сусликовн",
                    "avatar_url": "",
                    "university": "",
                    "is_online": false
                },
                {
                    "id": "dd9b9b3b-ac29-4798-a915-174f5ef35681",
                    "username": "lilysha.yyyyyyyyyyuu",
                    "firstname": "Николетта",
                    "lastname": "ЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩЩ",
                    "avatar_url": "https://quickflowapp.ru/minio/posts/155a4e44-e350-416a-a32b-087f434d294a.jpeg",
                    "university": "",
                    "is_online": false
                }
            ],
            "has_more": false,
            "total_count": 6
        }
    });
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

app.get('/api/feedback', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }

    res.status(200).json({
        "payload": {
            "average": 4.666666666666667,
            "feedbacks": [
                {
                    "type": "auth",
                    "text": "ijeg df g dfg  dfgfdgijdfigjd fgiudfgindfig frg",
                    "rating": 5,
                    "username": "rvasutenko",
                    "firstname": "Роман",
                    "lastname": "Васютенко"
                },
                {
                    "type": "auth",
                    "text": "ijeg df g dfg  dfgfdgijdfigjd fgiudfgindfig frg",
                    "rating": 4,
                    "username": "Timex",
                    "firstname": "Матвей",
                    "lastname": "Митрофанов"
                },
                {
                    "type": "auth",
                    "text": "ijeg df g dfg  dfgfdgijdfigjd fgiudfgindfig frg",
                    "rating": 5,
                    "username": "olala",
                    "firstname": "adsf",
                    "lastname": "adsfasdf"
                }
            ]
        }
    });
});

app.post('/api/feedback', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }

    return res.status(200).end();
});

const port = process.env.PORT || 3000;

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

server.listen(port, '0.0.0.0', null, function () {
    console.log(`Server listening port ${port}`);
});
