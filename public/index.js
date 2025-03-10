import Ajax from './modules/ajax.js';
import LoginView from './Views/LoginView/LoginView.js';
import SignupView from './Views/SignupView/SignupView.js';
import HeaderComponent from './Components/HeaderComponent/HeaderComponent.js';
import PostComponent from './Components/PostComponent/PostComponent.js';
import MenuComponent from './Components/MenuComponent/MenuComponent.js';

const root = document.getElementById('root');

const container = document.createElement('div');
container.classList.add('container');
root.appendChild(container);

const menuContainer = document.createElement('aside');
menuContainer.classList.add('menu');
const pageContainer = document.createElement('main');

const headerContainer = document.createElement('header');
headerContainer.classList.add('header');

container.appendChild(menuContainer);
container.appendChild(headerContainer);
container.appendChild(pageContainer);

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/Components/MenuComponent/MenuComponent.css';
document.head.appendChild(link);

/**
 * Конфигурация меню с маршрутами и функциями рендера
 * @type {Object}
 */
const config = {
    menu: {
        feed: {
            href: '/feed',
            text: 'Лента',
            icon: 'feed-icon',
            render: renderFeed
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
            render: renderLogout,
        }
    },
};

/**
 * Функция выхода пользователя
 * Выполняет AJAX-запрос на выход и перенаправляет на страницу авторизации
 * @returns {HTMLElement} - пустой div для рендера
 */
function renderLogout() {
    Ajax.post({
        url: '/logout',
        callback: (status) => {
            let isUnauthorized = status === 200;

            if (!isUnauthorized) {
                menu.goToPage(menu.menuElements.feed);
                menu.checkAuthPage();
                return;
            }

            menu.goToPage(menu.menuElements.login);
            menu.checkAuthPage();
        }
    });

    return document.createElement('div');
}

/**
 * Функция рендера ленты новостей
 * Загружает посты через AJAX и отображает их на странице
 * @returns {HTMLElement} - контейнер с лентой
 */
function renderFeed() {
    const feed = document.createElement('div');
    feed.classList.add('feed');

    Ajax.post({
        url: '/feed',
        body: {
            posts_count: 10
        },
        callback: (status, feedData) => {
            let isAuthorized = status === 200;

            if (!isAuthorized) {
                menu.goToPage(menu.menuElements.login);
                menu.checkAuthPage();
                return;
            }

            if (feedData && Array.isArray(feedData)) {
                feedData.forEach(({ id, creator_id, text, pics, created_at, like_count, repost_count, comment_count }) => {
                    new PostComponent(feed, {
                        id,
                        creator_id,
                        text,
                        pics,
                        created_at,
                        like_count,
                        repost_count,
                        comment_count,
                    });
                });
            }
        }
    });

    // Обработчик лайков на постах
    feed.addEventListener('click', (event) => {
        if (event.target.tagName.toLowerCase() === 'button' && event.target.dataset.imageId) {
            const { imageId: id } = event.target.dataset;

            Ajax.post({
                url: '/like',
                body: { id },
                callback: (status) => {
                    if (status === 200) {
                        const likeContainer = event.target.parentNode;
                        const likeCount = likeContainer.querySelector('span');
                        likeCount.textContent = `${parseInt(likeCount.textContent) + 1} лайков`;
                    }
                }
            });
        }
    });

    return feed;
}

// Создание меню и хедера
const menu = new MenuComponent(config, menuContainer);
menu.render();
menu.goToPage(menu.menuElements.feed);

const header = new HeaderComponent(headerContainer, menu);
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
