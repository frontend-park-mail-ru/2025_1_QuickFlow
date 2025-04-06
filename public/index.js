import LoginView from './Views/LoginView/LoginView.js';
import SignupView from './Views/SignupView/SignupView.js';
import FeedView from './Views/FeedView/FeedView.js';
import MessengerView from './Views/MessengerView/MessengerView.js';
import ProfileView from './Views/ProfileView/ProfileView.js';
import HeaderComponent from './Components/HeaderComponent/HeaderComponent.js';
import MenuComponent from './Components/MenuComponent/MenuComponent.js';
import createElement from './utils/createElement.js';
import Ajax from './modules/ajax.js';


const root = document.getElementById('root');

const container = createElement({
    parent: root,
    classes: ['container'],
});

createElement({
    tag: 'main',
    parent: container,
    classes: ['main']
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
        messenger: {
            href: '/messenger',
            text: 'Мессенджер',
            icon: 'messenger-icon',
            render: () => new MessengerView(menu).render(),
        },
    },
    isAuthorized: true,
};

const menu = new MenuComponent(container, config);
const header = new HeaderComponent(container, menu);

Ajax.get({
    url: '/user-dev-false',
    params: {
        posts_count: 10
    },

    callback: (status) => {
        let isAuthorized = status === 200;

        if (!isAuthorized) {
            menu.goToPage(menu.menuElements.login);
            menu.updateMenuVisibility(false);
            return;
        }

        menu.goToPage(menu.menuElements.messenger);
    }
});
