'use strict';

import express from 'express';
import body from 'body-parser';
import cookie from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import crypto from 'crypto';
import { users, posts, chats, messages } from '../public/mocks.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(express.static(path.resolve(__dirname, 'images')));
app.use('/static', express.static('static'));
app.use(body.json());
app.use(cookie());

const ids = {};

// function formUser(user) {
//     return {
//         ...user,
//         password: undefined,
//         images: user.images.map((id) => ({ ...images[id], id }))
//     };
// }

app.post('/signup', (req, res) => {
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

app.post('/login', (req, res) => {
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

app.post('/logout', (req, res) => {
    const id = req.cookies['podvorot'];
    
    if (!id) {
        return res.status(400).end();
    }

    delete ids[id];
    res.clearCookie('podvorot');

    res.status(200).end();
});


// app.get('/me', (req, res) => {
//     const id = req.cookies['podvorot'];
//     const email = ids[id];
//     if (!email || !users[email]) {
//         return res.status(401).end();
//     }

//     res.json(formUser(users[email]));
// });

app.get('/feed', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];

    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    res.status(200).json(posts);
});

app.get('/profiles/:username', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }

    const queryUsername = req.params.username;
    if (!queryUsername || !users[queryUsername]) {
        return res.status(400).end();
    }

    res.status(200).json(users[queryUsername]);
});

app.post('/profile', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }
    // TODO: добавить логику обновления данных
    res.status(200).end();
});

app.get('/chats', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }
    
    res.status(200).json(chats[username]);
});

app.get('/chat', (req, res) => {
    const id = req.cookies['podvorot'];
    const username = ids[id];
    if (!username || !users[username]) {
        return res.status(401).end();
    }

    if (!req.query || !req.query.username) {
        return res.status(400).end();
    }

    const queryUsername = req.query.username;
    if (!queryUsername || !messages[username][queryUsername]) {
        return res.status(404).end();
    }

    return res.status(200).json(messages[username][queryUsername]);
});

// app.post('/like', (req, res) => {
//     const id = req.cookies['podvorot'];
//     const emailSession = ids[id];
//     if (!emailSession || !users[emailSession]) {
//         return res.status(401).end();
//     }

//     const { id: imageId } = req.body;
//     images[imageId].likes++;

//     res.status(200).json({ status: 'ok' });
// });

const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server listening port ${port}`);
});
