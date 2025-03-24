import LoginView from './Views/LoginView/LoginView.js';
import SignupView from './Views/SignupView/SignupView.js';
import FeedView from './Views/FeedView/FeedView.js';
import LogoutView from './Views/LogoutView/LogoutView.js';
import ProfileView from './Views/ProfileView/ProfileView.js';
import HeaderComponent from './Components/HeaderComponent/HeaderComponent.js';
import MenuComponent from './Components/MenuComponent/MenuComponent.js';
import createElement from './utils/createElement.js';

const root = document.getElementById('root');

const container = createElement({
    parent: root,
    classes: ['container'],
});

const menuContainer = createElement({
    tag: 'aside',
    parent: container,
    classes: ['menu'],
});

createElement({
    tag: 'main',
    parent: container,
});

createElement({
    tag: 'link',
    parent: document.head,
    attrs: {
        rel: 'stylesheet',
        href: '/Components/MenuComponent/MenuComponent.css',
    }
});

const config = {
    menu: {
        profile: {
            href: '/profile',
            text: 'Профиль',
            icon: 'profile-icon',
            render: () => new ProfileView(menu).render(),
        },
        feed: {
            href: '/feed',
            text: 'Лента',
            icon: 'feed-icon',
            render: () => new FeedView(menu).render(),
        },
        login: {
            href: '/login',
            text: 'Авторизация',
            icon: 'login-icon',
            render: () => new LoginView(menu, header).render(),
        },
        signup: {
            href: '/signup',
            text: 'Регистрация',
            icon: 'signup-icon',
            render: () => new SignupView(menu, header).render(),
        },
        logout: {
            href: '/logout',
            text: 'Выйти',
            icon: 'logout-icon',
            render: () => new LogoutView(menu).render(),
        }
    },
    isAuthorized: true,
};

const menu = new MenuComponent(menuContainer, config);
menu.render();
menu.goToPage(menu.menuElements.profile);

const header = new HeaderComponent(container, menu);
header.render();
