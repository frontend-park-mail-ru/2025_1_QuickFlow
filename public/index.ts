import LoginView from '@views/LoginView/LoginView';
import SignupView from '@views/SignupView/SignupView';
import FeedView from '@views/FeedView/FeedView';
import MessengerView from '@views/MessengerView/MessengerView';
import ProfileView from '@views/ProfileView/ProfileView';
import LogoutView from '@views/LogoutView/LogoutView';
import EditProfileView from '@views/EditProfileView/EditProfileView';
import NotFoundView from '@views/NotFoundView/NotFoundView';

import HeaderComponent from '@components/HeaderComponent/HeaderComponent';
import MenuComponent from '@components/MenuComponent/MenuComponent';
import createElement from '@utils/createElement';
import router from '@router';

import ws from '@modules/WebSocketService';
import './index.scss';
import { getLsItem } from '@utils/localStorage';

import ThemeManager from '@modules/ThemeManager';
import LsStandaloneBridge from '@modules/LsStandaloneBridge';


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

router.register(LoginView, { path: '/login', section: null });
router.register(SignupView, { path: '/signup', section: null });
router.register(LogoutView, { path: '/logout', section: null });
router.register(FeedView, { path: '/feed' });
router.register(ProfileView, { path: '/profiles/{username}', section: '/profiles' });
router.register(MessengerView, { path: '/messenger/{username}', section: '/messenger' });
router.register(EditProfileView, { path: '/profile/edit', section: '/profiles' });
router.register(MessengerView, { path: '/messenger', section: '/messenger' });
router.register(NotFoundView, { path: '/not-found', section: null });

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
    },
    isAuthorized: true,
};

router.menu = new MenuComponent(container, config);
router.header = new HeaderComponent(container);

if (ws) null; // for linter

router.start();
