'use strict';

const express = require('express');
const body = require('body-parser');
const cookie = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const app = express();
const crypto = require('crypto');

app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(express.static(path.resolve(__dirname, 'images')));
app.use('/static', express.static('static'));
app.use(body.json());
app.use(cookie());

const posts = [
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "/273153700_118738253861831_5906416883131394354_n.jpeg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "/272708814_1158833634855293_1743973316352152210_n.webp.jpg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "/272464515_147005761018515_3100264353239753904_n.webp.jpg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "/259096143_252774593424446_3292295880799640700_n.jpeg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "/19984805_468099790230913_7469029070697660416_n.jpeg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "/16583858_168051673696142_846500378588479488_n.jpeg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
];

const users = {
    rvasutenko: {
        username: 'rvasutenko',
        password: 'Qwerty1!',
        firstname: 'rvasutenko',
        lastname: 'rvasutenko',
        sex: 1,
        birth_date: '2005-05-02',
    },
};
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
    console.log(username, password);
    if (!password || !username) {
        return res.status(400).json({ error: 'Не указано имя пользователя или пароль' });
    }
    if (!users[username] || users[username].password !== password) {
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

app.post('/feed', (req, res) => {
    const id = req.cookies['podvorot'];
    const usernameSession = ids[id];
    if (!usernameSession || !users[usernameSession]) {
        return res.status(401).end();
    }

    // const userSessionImagesSet = new Set(users[usernameSession].images);

    // const result2 = images
    //     .map((_, id) => ({ ..._, id }))
    //     .filter((_, id) => !userSessionImagesSet.has(id));

    // res.json(result2);
    res.status(200).json(posts);
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
