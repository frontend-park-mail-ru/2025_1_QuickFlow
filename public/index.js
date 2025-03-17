import LoginView from './Views/LoginView/LoginView.js';
import SignupView from './Views/SignupView/SignupView.js';
import FeedView from './Views/FeedView/FeedView.js';
import LogoutView from './Views/LogoutView/LogoutView.js';
import ProfileView from './Views/ProfileView/ProfileView.js';

import HeaderComponent from './Components/HeaderComponent/HeaderComponent.js';
import MenuComponent from './Components/MenuComponent/MenuComponent.js';

const root = document.getElementById('root');

const container = document.createElement('div');
container.classList.add('container');
root.appendChild(container);

const menuContainer = document.createElement('aside');
menuContainer.classList.add('menu');
const pageContainer = document.createElement('main');

container.appendChild(menuContainer);
container.appendChild(pageContainer);

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/Components/MenuComponent/MenuComponent.css';
document.head.appendChild(link);

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
            render: () => new LoginView(menu).render(),
        },
        signup: {
            href: '/signup',
            text: 'Регистрация',
            icon: 'signup-icon',
            render: () => new SignupView(menu).render(),
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

// Создание меню и хедера
const menu = new MenuComponent(menuContainer, config);
menu.render();
menu.goToPage(menu.menuElements.profile);

const header = new HeaderComponent(container, menu);
header.render();

// function renderProfile() {
//     const profile = document.createElement('div');

//     Ajax.get({
//         url: '/me',
//         callback: (status, responseString) => {
//             const isAuthorized = status === 200;

//             if (!isAuthorized) {
//                 menu.goToPage(menu.menuElements.login);
//                 return;
//             }

//             const {email, age, images} = JSON.parse(responseString);

//             const span = document.createElement('span');
//             span.textContent = `${email} ${age} лет`;
//             profile.appendChild(span);

//             if (images && Array.isArray(images)) {
//                 const div = document.createElement('div');
//                 profile.appendChild(div);

//                 images.forEach(({src, likes}) => {
//                     div.innerHTML += `<img src="${src}" width="500"/><div>${likes} лайков</div>`
//                 });
//             }
//         }
//     });

//     return profile;
// }

// function renderMessenger() {
//     const messenger = document.createElement('div');
//     return messenger;
// }

// function renderFriends() {
//     const friends = document.createElement('div');
//     return friends;
// }

// function renderCommunities() {
//     const communities = document.createElement('div');
//     return communities;
// }

// function renderPhoto() {
//     const photo = document.createElement('div');
//     return photo;
// }

// function renderMusic() {
//     const music = document.createElement('div');
//     return music;
// }

// function renderVideo() {
//     const video = document.createElement('div');
//     return video;
// }

// function renderGames() {
//     const games = document.createElement('div');
//     return games;
// }

// function renderBookmarks() {
//     const bookmarks = document.createElement('div');
//     return bookmarks;
// }

// function renderHelp() {
//     const help = document.createElement('div');
//     return help;
// }
