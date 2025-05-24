import HeaderComponent from '@components/HeaderComponent/HeaderComponent';
import MenuComponent from '@components/MenuComponent/MenuComponent';
import createElement from '@utils/createElement';
import router from '@router';

import './index.scss';

import ThemeManager from '@modules/ThemeManager';
import LsStandaloneBridge from '@modules/LsStandaloneBridge';
import registerSW from '@utils/registerSW';
import registerRoutes from './registerRoutes';
import ws from '@modules/WebSocketService';
import NotificationComponent from '@components/NotificationComponent/NotificationComponent';
import LsProfile from '@modules/LsProfile';


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

(async () => {
    await LsProfile.update();

    const config = {
        menu: {
            profiles: {
                href: `/profiles/${LsProfile.username}`,
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
    
    if (
        !router.path.startsWith('/scores') &&
        !router.path.startsWith('/login') &&
        !router.path.startsWith('/signup')
    ) {
        new ws().subscribe('message', (payload: Record<string, any>) => {
            console.log(router.path, payload?.sender?.username);

            if (
                router.path.startsWith('/messenger') ||
                payload?.sender?.username === LsProfile.username
            ) return;
        
            new NotificationComponent({
                type: 'msg',
                classes: ['notification_msg'],
                data: payload,
            });
        });
    }
    
    router.start();
})();
