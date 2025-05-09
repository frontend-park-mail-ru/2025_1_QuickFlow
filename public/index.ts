import HeaderComponent from '@components/HeaderComponent/HeaderComponent';
import MenuComponent from '@components/MenuComponent/MenuComponent';
import createElement from '@utils/createElement';
import router from '@router';

import './index.scss';
import { getLsItem } from '@utils/localStorage';

import ThemeManager from '@modules/ThemeManager';
import LsStandaloneBridge from '@modules/LsStandaloneBridge';
import registerSW from '@utils/registerSW';
import registerRoutes from './registerRoutes';
import ws from '@modules/WebSocketService';
import NotificationComponent from '@components/NotificationComponent/NotificationComponent';


registerSW();
LsStandaloneBridge.init();

const root = document.getElementById('root');

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.applyStoredTheme();
});

const container = createElement({
    parent: root,
    classes: ['parent', 'container'],
    attrs: {id: 'parent'},
});

const main = createElement({
    tag: 'main',
    parent: container,
    classes: ['main']
});

registerRoutes();

const config = {
    menu: {
        profiles: {
            href: `/profiles/${getLsItem('username', '')}`,
            text: 'Профиль',
            icon: 'profile-icon',
        },
        feed: {
            href: '/feed',
            text: 'Лента',
            icon: 'feed-icon',
        },
        login: {
            href: '/login',
            text: 'Авторизация',
            icon: 'login-icon',
        },
        signup: {
            href: '/signup',
            text: 'Регистрация',
            icon: 'signup-icon',
        },
        messenger: {
            href: '/messenger',
            text: 'Мессенджер',
            icon: 'messenger-icon',
        },
        friends: {
            href: '/friends',
            text: 'Друзья',
            icon: 'friends-icon',
        },
        communities: {
            href: '/communities',
            text: 'Сообщества',
            icon: 'communities-icon',
        },
    },
    isAuthorized: true,
};

router.menu = new MenuComponent(container, config);
router.header = new HeaderComponent(container);

new ws().subscribe('message', (payload: Record<string, any>) => {
    new NotificationComponent({
        type: 'msg',
        classes: ['notification_msg'],
        data: payload,
    });
});

// const payload = {
//     "id": "d5cb71f1-61f1-4f5e-8d0a-d0adf17cda94",
//     "text": "hkj dfogjodfjgoi df df g dfgdfgdijgdfiog dfgodfgoidfgiodfg fdoigdfoig ndfg dfgoidfig dfg df g dfgidfogodfgoidfi g dfg df godfo ig dfg df gdfgiodfgofdiogodfg fdg fdog fd godfgiodfiogoidfghkj dfogjodfjgoi df df g dfgdfgdijgdfiog dfgodfgoidfgiodfg fdoigdfoig ndfg dfgoidfig dfg df g dfgidfogodfgoidfi g dfg df godfo ig dfg df gdfgiodfgofdiogodfg fdg fdog fd godfgiodfiogoidfghkj dfogjodfjgoi df df g dfgdfgdijgdfiog dfgodfgoidfgiodfg fdoigdfoig ndfg dfgoidfig dfg df g dfgidfogodfgoidfi g dfg df godfo ig dfg df gdfgiodfgofdiogodfg fdg fdog fd godfgiodfiogoidfghkj dfogjodfjgoi df df g dfgdfgdijgdfiog dfgodfgoidfgiodfg fdoigdfoig ndfg dfgoidfig dfg df g dfgidfogodfgoidfi g dfg df godfo ig dfg df gdfgiodfgofdiogodfg fdg fdog fd godfgiodfiogoidfg",
//     "created_at": "2025-05-09T12:32:22Z",
//     "updated_at": "2025-05-09T12:32:22Z",
//     "attachment_urls": null,
//     "sender": {
//         "id": "6cbac770-225d-4358-9d9d-5f3cef176883",
//         "username": "rvasutenko",
//         "avatar_url": "https://quickflowapp.ru/minio/posts/3fadfcf0-572b-4f32-a8d9-5f620afefb3c.gif",
//         "firstname": "Роман",
//         "lastname": "Васютенко"
//     },
//     "chat_id": "1fc25f37-b16d-4d19-8faa-109d22351ea1"
// };

// setTimeout(() => {
//     new NotificationComponent({
//         type: 'msg',
//         classes: ['notification_msg'],
//         data: payload,
//     });
// }, 500);

// setTimeout(() => {
//     new NotificationComponent({
//         type: 'msg',
//         classes: ['notification_msg'],
//         data: payload,
//     });
// }, 1000);

// setTimeout(() => {
//     new NotificationComponent({
//         type: 'msg',
//         classes: ['notification_msg'],
//         data: payload,
//     });
// }, 1500);

router.start();
