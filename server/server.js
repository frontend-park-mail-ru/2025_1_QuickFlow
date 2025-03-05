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
app.use(body.json());
app.use(cookie());

const images = [
    {
        src: '/273153700_118738253861831_5906416883131394354_n.jpeg',
        likes: 120
    },
    {
        src: '/272708814_1158833634855293_1743973316352152210_n.webp.jpg',
        likes: 250
    },
    {
        src: '/272464515_147005761018515_3100264353239753904_n.webp.jpg',
        likes: 201
    },
    {
        src: '/259096143_252774593424446_3292295880799640700_n.jpeg',
        likes: 300
    },
    {
        src: '/19984805_468099790230913_7469029070697660416_n.jpeg',
        likes: 100500
    },
    {
        src: '/16583858_168051673696142_846500378588479488_n.jpeg',
        likes: 350
    }
];

const users = {
    'd.dorofeev@corp.mail.ru': {
        email: 'd.dorofeev@corp.mail.ru',
        password: 'password',
        age: 21
    },
    's.volodin@corp.mail.ru': {
        email: 's.volodin@corp.mail.ru',
        password: 'password',
        age: 27,
        images: [0, 1, 2, 3]
    },
    'aleksandr.tsvetkov@corp.mail.ru': {
        email: 'aleksandr.tsvetkov@corp.mail.ru',
        password: 'password',
        age: 30,
        images: [4, 5]
    },
    'a.ostapenko@corp.mail.ru': {
        email: 'a.ostapenko@corp.mail.ru',
        password: 'password',
        age: 21
    }
};
const ids = {};

function formUser(user) {
    return {
        ...user,
        password: undefined,
        images: user.images.map((id) => ({ ...images[id], id }))
    };
}

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

    const id = uuid();
    const user = { password, email, age, images: [] };
    ids[id] = email;
    users[email] = user;

    res.cookie('podvorot', id, {
        expires: new Date(Date.now() + 1000 * 60 * 10),
        // httpOnly: true //временно пока нет настройки для https
    });
    res.status(201).json({ id });
});

app.post('/login', (req, res) => {
    const password = req.body.password;
    const email = req.body.email;
    if (!password || !email) {
        return res.status(400).json({ error: 'Не указан E-Mail или пароль' });
    }
    if (!users[email] || users[email].password !== password) {
        return res.status(400).json({ error: 'Не верный E-Mail и/или пароль' });
    }

    const id = crypto.randomUUID();
    ids[id] = email;

    res.cookie('podvorot', id, {
        expires: new Date(Date.now() + 10000 * 60 * 10),
        // secure: true,
        httpOnly: true
    });
    res.status(200).json({ id });
});

app.get('/me', (req, res) => {
    const id = req.cookies['podvorot'];
    const email = ids[id];
    if (!email || !users[email]) {
        return res.status(401).end();
    }

    res.json(formUser(users[email]));
});

app.get('/feed', (req, res) => {
    const id = req.cookies['podvorot'];
    const emailSession = ids[id];
    if (!emailSession || !users[emailSession]) {
        return res.status(401).end();
    }

    const userSessionImagesSet = new Set(users[emailSession].images);

    const result2 = images
        .map((_, id) => ({ ..._, id }))
        .filter((_, id) => !userSessionImagesSet.has(id));

    res.json(result2);
});

app.post('/like', (req, res) => {
    const id = req.cookies['podvorot'];
    const emailSession = ids[id];
    if (!emailSession || !users[emailSession]) {
        return res.status(401).end();
    }

    const { id: imageId } = req.body;
    images[imageId].likes++;

    res.status(200).json({ status: 'ok' });
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server listening port ${port}`);
});