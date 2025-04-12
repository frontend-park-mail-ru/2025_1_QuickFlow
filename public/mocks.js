export const posts = [
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        author: {
            id: "b143b529-9925-450f-9d26-1255658a0a8f",
            username: "rvasutenko",
            avatar_url: "/avatars/avatar.jpg",
            firstname: "Илья",
            lastname: "Мациевский"
        },
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
        comment_count: 0,
        is_repost: true,
    },
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        author: {
            id: "b143b529-9925-450f-9d26-1255658a0a8f",
            username: "Nikita22",
            avatar_url: "/avatars/avatar.jpg",
            firstname: "Илья",
            lastname: "Мациевский"
        },
        text: "Hello, this is my first post",
        pics: [
            "https://quickflowapp.ru/images/image1.jpg",
            "https://quickflowapp.ru/images/image2.jpg",
            "https://quickflowapp.ru/images/image3.jpg",
        ],
        created_at: "2005-05-23",
        like_count: 0,
        repost_count: 0,
        comment_count: 0,
        is_repost: false,
    },
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        author: {
            id: "b143b529-9925-450f-9d26-1255658a0a8f",
            username: "Nikita22",
            avatar_url: "/avatars/avatar.jpg",
            firstname: "Илья",
            lastname: "Мациевский"
        },
        text: "Hello, this is my first post",
        pics: [
            "/posts/272464515_147005761018515_3100264353239753904_n.webp.jpg",
        ],
        created_at: "2005-03-12",
        like_count: 0,
        repost_count: 0,
        comment_count: 0,
        is_repost: false,
    },
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        author: {
            id: "b143b529-9925-450f-9d26-1255658a0a8f",
            username: "Nikita22",
            avatar_url: "/avatars/avatar.jpg",
            firstname: "Илья",
            lastname: "Мациевский"
        },
        text: "Hello, this is my first post",
        pics: [
            "/posts/259096143_252774593424446_3292295880799640700_n.jpeg",
        ],
        created_at: "2005-01-01",
        like_count: 0,
        repost_count: 0,
        comment_count: 0,
        is_repost: false,
    },
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        author: {
            id: "b143b529-9925-450f-9d26-1255658a0a8f",
            username: "Nikita22",
            avatar_url: "/avatars/avatar.jpg",
            firstname: "Илья",
            lastname: "Мациевский"
        },
        text: "Hello, this is my first post",
        pics: [
            "/posts/19984805_468099790230913_7469029070697660416_n.jpeg",
        ],
        created_at: "2005-02-07",
        like_count: 0,
        repost_count: 0,
        comment_count: 0,
        is_repost: true,
    },
    {
        id: "1674ca65-83dc-4dd7-a5ca-adc0298b54a3",
        author: {
            id: "b143b529-9925-450f-9d26-1255658a0a8f",
            username: "Nikita22",
            avatar_url: "/avatars/avatar.jpg",
            firstname: "Илья",
            lastname: "Мациевский"
        },
        text: "Hello, this is my first post",
        pics: [
            "/posts/16583858_168051673696142_846500378588479488_n.jpeg",
        ],
        created_at: "2025-04-02",
        like_count: 0,
        repost_count: 0,
        comment_count: 0,
        is_repost: true,
    },
];

export const users = {
    rvasutenko: {
        profile: {
            username: "rvasutenko",
            password: 'Qwerty1!', // Нужен на тестовом серваке для авторизации
            firstname: "Роман",
            lastname: "Васютенко",
            sex: 0,
            birth_date: "2005-05-02",
            bio: "Тут пара слов обо мне, моих увлечениях, занятиях и предпочтениях",
            avatar_url: "/avatars/avatar.jpg",
            cover_url: "/covers/profile-header.jpg",
        },
        contact_info: {
            city: "Moscow",
            email: "vasyutenko20050205@mail.ru",
            phone: "89648826455"
        },
        school: {
            school_city: "Ахтубинск",
            school_name: "МБОУ СОШ №4"
        },
        university: {
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
            id: "49dc794b-d8cf-404c-be69-4886bd78ada4",
            name: "Александр Павловский",
            avatar_url: '/avatars/avatar4.jpg',
            created_at: "2025-04-11T16:46:32.821303+03:00",
            updated_at: "2025-04-11T16:46:33.373724+03:00",
            type: "private",
            last_message: {
                id: "218503be-332d-4639-b540-5f2f58e63f38",
                text: "HelloHello123!",
                created_at: "2025-04-11T16:46:33.373724+03:00",
                updated_at: "2025-04-11T16:46:33.373724+03:00",
                is_read: false,
                attachment_urls: null,
                sender_id: "12c314cb-19ae-40c8-a069-fb2c426a9cc9",
                chat_id: "49dc794b-d8cf-404c-be69-4886bd78ada4"
            }
        },
        {
            id: "13dc794b-d8cf-404c-be69-4886bd78ada4",
            name: "Макс Павловский",
            avatar_url: '/avatars/avatar6.jpg',
            created_at: "2025-04-11T16:46:32.821303+03:00",
            updated_at: "2025-04-11T16:46:33.373724+03:00",
            type: "private",
            last_message: {
                id: "248503be-332d-4639-b540-5f2f58e63f38",
                text: "Пока",
                created_at: "2025-04-10T16:46:33.373724+03:00",
                updated_at: "2025-04-11T16:46:33.373724+03:00",
                is_read: false,
                attachment_urls: null,
                sender_id: "02c314cb-19ae-40c8-a069-fb2c426a9cc9",
                chat_id: "13dc794b-d8cf-404c-be69-4886bd78ada4"
            }
        },
        {
            id: "85dc794b-d8cf-404c-be69-4886bd78ada4",
            name: "Валера Павловский",
            avatar_url: '/avatars/avatar5.jpg',
            created_at: "2025-04-11T16:46:32.821303+03:00",
            updated_at: "2025-04-11T16:46:33.373724+03:00",
            type: "private",
            last_message: {
                id: "268503be-332d-4639-b540-5f2f58e63f38",
                text: "С новым годом",
                created_at: "2025-03-11T16:46:33.373724+03:00",
                updated_at: "2025-04-11T16:46:33.373724+03:00",
                is_read: true,
                attachment_urls: null,
                sender_id: "42c314cb-19ae-40c8-a069-fb2c426a9cc9",
                chat_id: "85dc794b-d8cf-404c-be69-4886bd78ada4"
            }
        },
    ]
};

export const messages = {
    rvasutenko: {
        "49dc794b-d8cf-404c-be69-4886bd78ada4": [
            {
                "id": "9a00f4b4-7914-4a3e-91be-c5a7b51bc607",
                "text": "HelloHello!",
                "created_at": "2025-04-10T19:08:42.323841+03:00",
                "updated_at": "2025-04-10T19:08:42.323841+03:00",
                "is_read": true,
                "attachment_urls": null,
                "sender_id": "0e146b4b-b28e-44b8-8c59-f0c182459756",
                "chat_id": "c828ab93-88dd-4855-a309-940b064e9011"
            },
            {
                "id": "dcbe8d04-95c3-48c1-ac1f-2d4ab726733d",
                "text": "Hello!",
                "created_at": "2025-04-10T19:08:27.926906+03:00",
                "updated_at": "2025-04-10T19:08:27.926906+03:00",
                "is_read": false,
                "attachment_urls": null,
                "sender_id": "0e146b4b-b28e-44b8-8c59-f0c182459756",
                "chat_id": "c828ab93-88dd-4855-a309-940b064e9011"
            },
            {
                "id": "2ecd2a66-d5ad-4c09-8b43-0918ae59e38b",
                "text": "Hello!",
                "created_at": "2025-04-10T19:00:36.19391+03:00",
                "updated_at": "2025-04-10T19:00:36.19391+03:00",
                "is_read": false,
                "attachment_urls": null,
                "sender_id": "0e146b4b-b28e-44b8-8c59-f0c182459756",
                "chat_id": "c828ab93-88dd-4855-a309-940b064e9011"
            }
        ]
    }
};