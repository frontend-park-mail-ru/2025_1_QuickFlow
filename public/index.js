import Ajax from './modules/ajax.js';
import LoginView from './Views/LoginView/LoginView.js';
import SignupView from './Views/SignupView/SignupView.js';
import HeaderComponent from './Components/HeaderComponent/HeaderComponent.js';
import PostComponent from './Components/PostComponent/PostComponent.js';
import MenuComponent from './Components/MenuComponent/MenuComponent.js';

// export default class App {
//     constructor() {

//     }

//     render() {

//     }
// }

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
container.appendChild(headerContainer);
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

function renderFeed() {
    const feed = document.createElement('div');
    feed.classList.add('feed');

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

    Ajax.get({
        url: '/feed',
        callback: (status, responseString) => {
            let isAuthorized = status === 200;

            if (!isAuthorized) {
                menu.goToPage(menu.menuElements.signup);
                return;
            }

            renderSideMenu()

            // const callbackFeed = JSON.stringify([
            //     {
            //         "id": "00000000-0000-0000-0000-000000000000",
            //         "creator_id": "b0ce0ceb-0028-4cd1-a248-457dc151e97e",
            //         "text": 'Аԥсны (Абхазия) в переводе с абхазского — "страна души". И действительно, поездка туда впечаталась в душу и стала испытанием для тела: пока это наше единственное путешествие, где мы три дня не мылись, купались в море с коровами, все время от чего-нибудь лечились, шарахались от машин на переходах и от собак в подворотнях, сгоняли кошек со стульев в кафе и вырывали наших детей из рук прохожих. Но поскольку мы все же благополучно вернулись домой, я могу обо всем подробнейшим образом написать здесь (от души, так скажем). Сейчас — вводный пост, потом будет весь наш маршрут поэтапно, а в конце моих путевых заметок подведем итоги по стоимости поездки.',
            //         "pics": [
            //             "/273153700_118738253861831_5906416883131394354_n.jpeg"
            //         ],
            //         "created_at": "2025-03-02 22:37:30",
            //         "like_count": 0,
            //         "repost_count": 0,
            //         "comment_count": 0
            //     },
            //     {
            //         "id": "dd9aeb03-225d-4119-9154-1e29ea354123",
            //         "creator_id": "b0ce0ceb-0028-4cd1-a248-457dc151e97e",
            //         "text": "Hello, this is my second post",
            //         "pics": [
            //             "/272708814_1158833634855293_1743973316352152210_n.webp.jpg"
            //         ],
            //         "created_at": "2025-03-05 22:46:19",
            //         "like_count": 0,
            //         "repost_count": 0,
            //         "comment_count": 0
            //     }
            // ]);

            const feedData = JSON.parse(responseString);
            // const feedData = JSON.parse(callbackFeed);

            if (feedData && Array.isArray(feedData)) {
                // const div = document.createElement('div');
                // feed.appendChild(div);

                // console.log(feedData);

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
