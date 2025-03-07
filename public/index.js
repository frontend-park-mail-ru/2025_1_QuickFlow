import Ajax from './modules/ajax.js';
import LoginView from './Views/LoginView/LoginView.js';
import SignupView from './Views/SignupView/SignupView.js';
import HeaderComponent from './Components/HeaderComponent/HeaderComponent.js';
import MenuComponent from './Components/MenuComponent/MenuComponent.js';

const root = document.getElementById('root');

const container = document.createElement('div');
container.classList.add('container');
root.appendChild(container);


const menuContainer = document.createElement('aside');
menuContainer.classList.add('menu'); // Добавляем класс для сетки
const pageContainer = document.createElement('main');

const headerContainer = document.createElement('header');
headerContainer.classList.add('header');
container.appendChild(menuContainer);
container.appendChild(pageContainer);
container.appendChild(headerContainer);

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
            render: renderProfile
        },
        feed: {
            href: '/feed',
            text: 'Лента',
            icon: 'feed-icon',
            render: renderFeed
        },
        messenger: {
            href: '/messenger',
            text: 'Мессенджер',
            icon: 'messenger-icon',
            render: renderMessenger
        },
        friends: {
            href: '/friends',
            text: 'Друзья',
            icon: 'friends-icon',
            render: renderFriends
        },
        communities: {
            href: '/communities',
            text: 'Сообщества',
            icon: 'communities-icon',
            render: renderCommunities
        },
        photo: {
            href: '/photo',
            text: 'Фото',
            icon: 'photo-icon',
            render: renderPhoto
        },
        music: {
            href: '/music',
            text: 'Музыка',
            icon: 'music-icon',
            render: renderMusic
        },
        video: {
            href: '/video',
            text: 'Видео',
            icon: 'video-icon',
            render: renderVideo
        },
        games: {
            href: '/games',
            text: 'Игры',
            icon: 'games-icon',
            render: renderGames
        },
        bookmarks: {
            href: '/bookmarks',
            text: 'Закладки',
            icon: 'bookmarks-icon',
            render: renderBookmarks
        },
        help: {
            href: '/help',
            text: 'Помощь',
            icon: 'help-icon',
            render: renderHelp
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
        }
    },
};

// function renderSignup() {
//     const form = document.createElement('form');

//     const emailInput = createInput('email', 'Емайл', 'email');
//     const passwordInput = createInput('password', 'Пароль', 'password');
//     const ageInput = createInput('number', 'Возраст', 'age');

//     const submitBtn = document.createElement('input');
//     submitBtn.type = 'submit';
//     submitBtn.value = 'Зарегистрироваться!';

//     form.appendChild(emailInput);
//     form.appendChild(passwordInput);
//     form.appendChild(ageInput);
//     form.appendChild(submitBtn);
//     return form;
// }

function renderFeed() {
    const feed = document.createElement('div');

    function renderSideMenu() {
        const sideMenu = document.createElement('a');
        sideMenu.classList.add('side-menu');

        // Добавляем несколько элементов в меню (например, ссылки)
        const menuItems = ['Лента', 'Рекомендации', 'Поиск', 'Комментарии', 'Реакции'];
        menuItems.forEach(itemText => {
            const menuItem = document.createElement('a');
            menuItem.classList.add('side-menu-item');
            menuItem.textContent = itemText;
            sideMenu.appendChild(menuItem);
        });

        container.appendChild(sideMenu); //лучше в pageContainer, но не смог в нем выровнять пока
    }

    renderSideMenu()

    Ajax.get({
        url: '/feed',
        callback: (status, responseString) => {
            let isAuthorized = status === 200;

            if (!isAuthorized) {
                alert('Нет авторизации!');
                menu.goToPage(menu.menuElements.signup);
                // window.location.replace("/login");
                return;
            }

            const images = JSON.parse(responseString);

            if (images && Array.isArray(images)) {
                const div = document.createElement('div');
                feed.appendChild(div);

                images.forEach(({ src, likes, id }) => {
                    div.innerHTML += `<img src="${src}" alt="image" width="500">`;
                    const likeContainer = document.createElement('div');
                    div.appendChild(likeContainer);

                    likeContainer.innerHTML = `<span>${likes} лайков</span>`;

                    const likeBtn = document.createElement('button');
                    likeBtn.textContent = 'Лайк!';
                    likeBtn.type = 'button';
                    likeBtn.dataset.imageId = id;

                    likeContainer.appendChild(likeBtn);
                });
            }
        }
    });

    feed.addEventListener('click', (event) => {
        if (event.target.tagName.toLocaleLowerCase() === 'button' && event.target.dataset.imageId) {
            const { imageId: id } = event.target.dataset;

            Ajax.post( {url: '/like', body: { id }, callback: (status) => {
                if (status === 200) {
                    const likeContainer = event.target.parentNode;
                    const likeCount = likeContainer.querySelector('span');
                    likeCount.textContent = `${parseInt(likeCount.textContent) + 1} лайков`;
                }}
            });
        }
    });

    return feed;
}

const menu = new MenuComponent(config, menuContainer);
menu.render();
menu.goToPage(menu.menuElements.feed)

const header = new HeaderComponent(headerContainer, menu);
header.render();

function renderProfile() {
    const profile = document.createElement('div');

    Ajax.get({
        url: '/me',
        callback: (status, responseString) => {
            const isAuthorized = status === 200;

            if (!isAuthorized) {
                alert('АХТУНГ! нет авторизации');
                // goToPage(appState.menuElements.login);
                menu.goToPage(menu.menuElements.login);
                return;
            }

            const {email, age, images} = JSON.parse(responseString);

            const span = document.createElement('span');
            span.textContent = `${email} ${age} лет`;
            profile.appendChild(span);

            if (images && Array.isArray(images)) {
                const div = document.createElement('div');
                profile.appendChild(div);

                images.forEach(({src, likes}) => {
                    div.innerHTML += `<img src="${src}" width="500"/><div>${likes} лайков</div>`
                });
            }
        }
    });

    return profile;
}

function renderMessenger() {
    const messenger = document.createElement('div');
    return messenger;
}

function renderFriends() {
    const friends = document.createElement('div');
    return friends;
}

function renderCommunities() {
    const communities = document.createElement('div');
    return communities;
}

function renderPhoto() {
    const photo = document.createElement('div');
    return photo;
}

function renderMusic() {
    const music = document.createElement('div');
    return music;
}

function renderVideo() {
    const video = document.createElement('div');
    return video;
}

function renderGames() {
    const games = document.createElement('div');
    return games;
}

function renderBookmarks() {
    const bookmarks = document.createElement('div');
    return bookmarks;
}

function renderHelp() {
    const help = document.createElement('div');
    return help;
}
