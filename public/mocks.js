export const posts = [
    {
        firstname: 'Илья',
        lastname: 'Мациевский',
        avatar: '/avatars/avatar.jpg',
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: 'Аԥсны (Абхазия) в переводе с абхазского — "страна души". И действительно, поездка туда впечаталась в душу и стала испытанием для тела: пока это наше единственное путешествие, где мы три дня не мылись, купались в море с коровами, все время от чего-нибудь лечились, шарахались от машин на переходах и от собак в подворотнях, сгоняли кошек со стульев в кафе и вырывали наших детей из рук прохожих. Но поскольку мы все же благополучно вернулись домой, я могу обо всем подробнейшим образом написать здесь (от души, так скажем). Сейчас — вводный пост, потом будет весь наш маршрут поэтапно, а в конце моих путевых заметок подведем итоги по стоимости поездки.',
        pics: [
            "/posts/IMG_6776.jpg",
            "/posts/273153700_118738253861831_5906416883131394354_n.jpeg",
            "/posts/272708814_1158833634855293_1743973316352152210_n.webp.jpg",
            "/posts/272464515_147005761018515_3100264353239753904_n.webp.jpg",
            "/posts/259096143_252774593424446_3292295880799640700_n.jpeg",
            "/posts/19984805_468099790230913_7469029070697660416_n.jpeg",
            "/posts/16583858_168051673696142_846500378588479488_n.jpeg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
    {
        firstname: 'Илья',
        lastname: 'Мациевский',
        avatar: '/avatars/avatar.jpg',
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "https://quickflowapp.ru/images/image1.jpg",
            "https://quickflowapp.ru/images/image2.jpg",
            "https://quickflowapp.ru/images/image3.jpg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
    {
        firstname: 'Илья',
        lastname: 'Мациевский',
        avatar: '/avatars/avatar.jpg',
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "/posts/272464515_147005761018515_3100264353239753904_n.webp.jpg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
    {
        firstname: 'Илья',
        lastname: 'Мациевский',
        avatar: '/avatars/avatar.jpg',
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "/posts/259096143_252774593424446_3292295880799640700_n.jpeg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
    {
        firstname: 'Илья',
        lastname: 'Мациевский',
        avatar: '/avatars/avatar.jpg',
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "/posts/19984805_468099790230913_7469029070697660416_n.jpeg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
    {
        firstname: 'Илья',
        lastname: 'Мациевский',
        avatar: '/avatars/avatar.jpg',
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        creator_id: "9c5a7aff-c703-4b11-a5ca-d45833091c90",
        text: "Hello, this is my first post",
        pics: [
            "/posts/16583858_168051673696142_846500378588479488_n.jpeg",
        ],
        created_at: "2005-05-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0
    },
];

export const users = {
    rvasutenko: {
        username: "rvasutenko",
        password: 'Qwerty1!', // Нужен на тестовом серваке для авторизации
        firstname: "Роман",
        lastname: "Васютенко",
        sex: 0,
        birth_date: "2005-05-02",
        bio: "Тут пара слов обо мне, моих увлечениях, занятиях и предпочтениях",
        avatar_url: "/avatars/avatar.jpg",
        cover_url: "/covers/profile-header.jpg",
        contact_info: {
            city: "Moscow",
            email: "vasyutenko20050205@mail.ru",
            phone: "89648826455"
        },
        school_education: {
            school_city: "Ахтубинск",
            school_name: "МБОУ СОШ №4"
        },
        university_education: {
            univ_city: "Москва",
            univ_name: "МГТУ им. Н.Э. Баумана",
            faculty: "Социальные и гуманитарные науки",
            grad_year: 2027
        }
    }    
};

export const profileFriends = [
    {
        name: 'Андрей',
        avatar: '/avatars/avatar.jpg'
    },
    {
        name: 'Максим',
        avatar: '/avatars/avatar.jpg'
    },
    {
        name: 'Ольга',
        avatar: '/avatars/avatar.jpg'
    },
    {
        name: 'Анатолий',
        avatar: '/avatars/avatar.jpg'
    },
    {
        name: 'Анна',
        avatar: '/avatars/avatar.jpg'
    },
    {
        name: 'Лилия',
        avatar: '/avatars/avatar.jpg'
    },
    {
        name: 'Максим',
        avatar: '/avatars/avatar.jpg'
    },
    {
        name: 'Ольга',
        avatar: '/avatars/avatar.jpg'
    },
];

export const chats = {
    rvasutenko: [
        {
            username: 'pavlov',
            name: 'Александр Павловский',
            avatar: '/avatars/avatar4.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч', // TODO: убрать хардкод и поменть на timestamp
        },
        {
            username: 'andrew',
            name: 'Андрей Контемиров',
            avatar: '/avatars/avatar5.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
        {
            username: 'maxutka',
            name: 'Максим Поздняков',
            avatar: '/avatars/avatar6.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
        {
            username: 'matthew',
            name: 'Матвей Хаметов',
            avatar: '/avatars/avatar7.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
        {
            username: 'nik_vor',
            name: 'Никита Воробьев',
            avatar: '/avatars/avatar8.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
        {
            username: 'baran2003',
            name: 'Анастасия Баранникова',
            avatar: '/avatars/avatar9.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
        {
            username: 'olchik',
            name: 'Ольга Склярова',
            avatar: '/avatars/avatar10.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
        {
            username: 'vlli',
            name: 'Влад Ли',
            avatar: '/avatars/avatar11.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
        {
            username: 'tolly_molly',
            name: 'Ксения Сивашова',
            avatar: '/avatars/avatar4.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
        {
            username: 'braznetz',
            name: 'Eugenii Braznetz',
            avatar: '/avatars/avatar5.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
        {
            username: 'xusha',
            name: 'Ксюша Логинова',
            avatar: '/avatars/avatar6.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
        {
            username: 'kate_b',
            name: 'Катя Беседовская',
            avatar: '/avatars/avatar7.jpg',
            lastMsg: 'Привет, как дела?',
            lastMsgTime: '1ч',
        },
    ]
};

export const messages = {
    rvasutenko: {
        pavlov: [
            {
                id: 1,
                from: 'pavlov',
                text: 'Привет, как дела?',
                timestamp: '2025-03-28 22:00:00',
                isRead: true
            },
            {
                id: 2,
                from: 'pavlov',
                text: 'Что нового произошло за неделю?',
                timestamp: '2025-03-28 22:00:00',
                isRead: true
            },
            {
                id: 3,
                from: 'rvasutenko',
                text: 'Привет, все отлично',
                timestamp: '2025-03-28 22:00:00',
                isRead: true
            },
            {
                id: 4,
                from: 'rvasutenko',
                text: 'На днях ходил на новую выставку в винзаводе',
                timestamp: '2025-03-28 22:00:00',
                isRead: true
            },
            {
                id: 5,
                from: 'rvasutenko',
                text: 'Очень классная, так что советую',
                timestamp: '2025-03-28 22:00:00',
                isRead: true
            },
            {
                id: 6,
                from: 'rvasutenko',
                text: 'Сам то ты как?',
                timestamp: '2025-03-28 22:00:00',
                isRead: true
            },
            {
                id: 7,
                from: 'pavlov',
                text: 'Да у меня тоже все хорошо. Завтра поеду в Казань с одногруппниками. Давно собирались сгонять своей компанией, но все никак не могли спланировать нормально. Вот, наконец-то руки добрались, хахах',
                timestamp: '2025-03-28 22:00:00',
                isRead: true
            },
            {
                id: 8,
                from: 'rvasutenko',
                text: 'О, Казань - это классно, нереально красивый город',
                timestamp: '2025-03-28 22:00:00',
                isRead: true
            },
            {
                id: 9,
                from: 'rvasutenko',
                text: 'Расскажешь потом, как съездили',
                timestamp: '2025-03-28 22:00:00',
                isRead: true
            },
            {
                id: 10,
                from: 'pavlov',
                text: 'Да, окей',
                timestamp: '2025-03-28 22:00:00',
                isRead: true
            },
            {
                id: 11,
                from: 'pavlov',
                text: 'Слушай, я давно хотел у тебя спросить что-то очень важное, но вот, к сожалению, сейчас никак не могу припомнить, что именно. Знаешь, я, наверное, тебе напишу чуть позже, как вспомню) Привет! Давно хотел у тебя спросить что-то очень важное, но вот, к сожалению, сейчас никак не могу припомнить, что именно. Знаешь, я, наверное, тебе напишу чуть позже, как вспомню)',
                timestamp: '2025-03-29 22:00:00',
                isRead: true
            },
        ],
        andrew: [],
        maxutka: [],
        matthew: [],
        nik_vor: [],
        baran2003: [],
        olchik: [],
        vlli: [],
        tolly_molly: [],
        braznetz: [],
        xusha: [],
        kate_b: [],
    }
};