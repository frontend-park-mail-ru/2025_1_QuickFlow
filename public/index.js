import LoginView from './Views/LoginView/LoginView.js';
import SignupView from './Views/SignupView/SignupView.js';
import FeedView from './Views/FeedView/FeedView.js';
import MessengerView from './Views/MessengerView/MessengerView.js';
import ProfileView from './Views/ProfileView/ProfileView.js';
import LogoutView from './Views/LogoutView/LogoutView.js';
import EditProfileView from './Views/EditProfileView/EditProfileView.js';
import NotFoundView from './Views/NotFoundView/NotFoundView.js';

import HeaderComponent from './Components/HeaderComponent/HeaderComponent.js';
import MenuComponent from './Components/MenuComponent/MenuComponent.js';
import createElement from './utils/createElement.js';
import router from './Router.js';
import './index.scss';


const root = document.getElementById('root');

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
router.register(EditProfileView, { path: '/profile/edit', section: '/profiles' });
router.register(MessengerView, { path: '/messenger' });
router.register(NotFoundView, { path: '/not-found', section: null });

const config = {
    menu: {
        profiles: {
            href: '/profiles/rvasutenko',
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

router.start();
