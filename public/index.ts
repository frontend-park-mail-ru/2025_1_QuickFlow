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

createElement({
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

if (!router.path.startsWith('/scores')) {
    new ws().subscribe('message', (payload: Record<string, any>) => {
        if (payload?.sender?.username === getLsItem('username', '')) return;
    
        new NotificationComponent({
            type: 'msg',
            classes: ['notification_msg'],
            data: payload,
        });
    });
}

router.start();
