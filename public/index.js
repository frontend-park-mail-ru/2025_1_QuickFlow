const root = document.getElementById('root');

renderHeader();

const menuContainer = document.createElement('aside');
menuContainer.classList.add('menu'); // Добавляем класс для сетки
const pageContainer = document.createElement('main');
root.appendChild(menuContainer);
root.appendChild(pageContainer);

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
            render: renderLogin
        },
    },

    // как будто в этом случае не нужно. Или нужно все-таки?)
    // side_menu: {
    //     feed: {
    //         text: 'Лента'
    //     },
    //     recommendations: {
    //         text: 'Рекомендации'
    //     },
    //     search: {
    //         text: 'Поиск'
    //     },
    //     comments: {
    //         text: 'Комментарии'
    //     },
    //     reactions: {
    //         text: 'Реакции'
    //     }
    // }
};

const appState = {
    activePageLink: null,
    menuElements: {}
};

function ajax(method, url, body = null, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        callback(xhr.status, xhr.responseText);
    });

    if (body) {
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf8');
        xhr.send(JSON.stringify(body));
        return;
    }

    xhr.send();
}

function goToPage(menuElement) {
    pageContainer.innerHTML = '';

    //временное решение пока не буду закидывать side-menu в pageContainer
    const sideMenu = document.querySelector('.side-menu');
    if (sideMenu) {
        sideMenu.remove();
    }

    appState.activePageLink.classList.remove('active');
    menuElement.classList.add('active');
    appState.activePageLink = menuElement;

    const element = config.menu[menuElement.dataset.section].render();

    pageContainer.appendChild(element);
}

function createInput(type, text, name) {
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.placeholder = text;

    return input;
}

function renderLogin() {
    const form = document.createElement('form');

    const emailInput = createInput('email', 'Емайл', 'email');
    const passwordInput = createInput('password', 'Пароль', 'password');

    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.value = 'Войти!';

    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(submitBtn);

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        ajax('POST', '/login', { email, password }, (status) => {
            status === 200
                ? goToPage(appState.menuElements.profile)
                : alert('НЕВЕРНЫЙ ЛОГИН ИЛИ ПАРОЛЬ');
        });
    });

    return form;
}

function renderSignup() {
    const form = document.createElement('form');

    const emailInput = createInput('email', 'Емайл', 'email');
    const passwordInput = createInput('password', 'Пароль', 'password');
    const ageInput = createInput('number', 'Возраст', 'age');

    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.value = 'Зарегистрироваться!';

    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(ageInput);
    form.appendChild(submitBtn);
    return form;
}

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

        root.appendChild(sideMenu); //лучше в pageContainer, но не смог в нем выровнять пока
    }

    renderSideMenu()

    ajax('GET', '/feed', null, (status, response) => {
        const isAuthorized = status === 200;
        if (!isAuthorized) {
            goToPage(appState.menuElements.login);
            return;
        }

        const images = JSON.parse(response);

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
    });

    feed.addEventListener('click', (event) => {
        if (event.target.tagName.toLocaleLowerCase() === 'button' && event.target.dataset.imageId) {
            const { imageId: id } = event.target.dataset;

            ajax('POST', '/like', { id }, (status) => {
                if (status === 200) {
                    const likeContainer = event.target.parentNode;
                    const likeCount = likeContainer.querySelector('span');
                    likeCount.textContent = `${parseInt(likeCount.textContent) + 1} лайков`;
                }
            });
        }
    });

    return feed;
}

function renderMenu() {
    Object.entries(config.menu).forEach(([key, { href, text, icon }], index) => {
        const menuElement = document.createElement('a');
        menuElement.href = href;
        menuElement.classList.add('menu-item'); // Добавляем класс

        // Создаем элемент иконки
        const iconElement = document.createElement('img');
        iconElement.src = `/static/img/${icon}.svg`;
        iconElement.classList.add('menu-icon');

        iconElement.classList.add(...icon.split(' ')); // Добавляем классы иконки

        // Добавляем иконку и текст
        menuElement.appendChild(iconElement);
        menuElement.appendChild(document.createTextNode(` ${text}`));

        menuElement.dataset.section = key;

        if (index === 0) {
            menuElement.classList.add('active');
            appState.activePageLink = menuElement;
        }

        appState.menuElements[key] = menuElement;
        menuContainer.appendChild(menuElement);
    });

    menuContainer.addEventListener('click', (event) => {
        if (
            event.target.tagName.toLocaleLowerCase() === 'a' ||
            event.target instanceof HTMLAnchorElement
        ) {
            event.preventDefault();
            goToPage(event.target);
        }
    });
}

function renderHeader() {
    function renderLogo() {
        const logo = document.createElement('a');
        logo.href = '/feed'
        logo.classList.add('logo-item');
        const iconElement = document.createElement('img');
        const nameElement = document.createElement('img');
        iconElement.src = `/static/img/logo-icon.svg`;
        nameElement.src = `/static/img/quickFlow-icon.svg`;

        logo.appendChild(iconElement); // Добавляем иконку
        logo.appendChild(nameElement); // Добавляем текст

        root.appendChild(logo);

        logo.addEventListener('click', (event) => {
            event.preventDefault();  // Отменяем стандартный переход
            goToPage(appState.menuElements.feed);  // Переход на страницу ленты через JS
        });
    }

    function renderSearch() {
        const searchContainer = document.createElement('a');
        searchContainer.classList.add('search-container');
        searchContainer.href = '/feed' /*временная заглушка*/

        const search = document.createElement('input');
        search.classList.add('search-item');
        search.setAttribute('type', 'text');
        search.setAttribute('placeholder', 'Поиск');

        const icon = document.createElement('img');
        icon.src = '/static/img/search-icon.svg'; // Путь к иконке
        icon.classList.add('search-icon'); // Класс для иконки

        const iconContainer = document.createElement('a');
        iconContainer.classList.add('search-icon-container');

        const notIcon = document.createElement('img');
        notIcon.src = '/static/img/notice-icon.svg';
        notIcon.classList.add('notice-icon');

        const musicIcon = document.createElement('img');
        musicIcon.src = '/static/img/music-icon-top.svg';
        musicIcon.classList.add('music-icon-top');


        searchContainer.appendChild(icon); // Добавляем иконку в контейнер
        searchContainer.appendChild(search); // Добавляем инпут в контейнер

        iconContainer.appendChild(notIcon);
        iconContainer.appendChild(musicIcon);


        root.appendChild(searchContainer); // Добавляем контейнер в DOM
        root.appendChild(iconContainer);

        searchContainer.addEventListener('click', (event) => {
            event.preventDefault();  // Отменяем стандартный переход
            goToPage(appState.menuElements.feed);  // Переход на страницу ленты через JS
        });

    }

    function renderAvatar() {
        const avatarContainer = document.createElement('div');
        avatarContainer.classList.add('avatar-container');

        const avatar = document.createElement('img');
        avatar.src = '/static/img/avatar.jpg';
        avatar.classList.add('avatar');

        const dropdownButton = document.createElement('button');
        dropdownButton.classList.add('dropdown-button');
        dropdownButton.innerHTML = '&#9662;'; // Символ галочки вниз

        avatarContainer.appendChild(avatar);
        avatarContainer.appendChild(dropdownButton);

        root.appendChild(avatarContainer);
    }

    renderLogo()
    renderSearch()
    renderAvatar()

    // return logo;
}


function renderProfile() {
    const profile = document.createElement('div');

    ajax('GET', '/me', null, (status, responseString) => {
        const isAuthorized = status === 200;

        if (!isAuthorized) {
            alert('АХТУНГ! НЕТ АВТОРИЗАЦИИ');
            goToPage(appState.menuElements.login);
        }

        const { age, email, images } = JSON.parse(responseString);

        const span = document.createElement('span');
        span.innerText = `Возраст: ${age}, email: ${email}`;
        profile.appendChild(span);

        if (images && Array.isArray(images)) {
            const div = document.createElement('div');
            profile.appendChild(div);

            images.forEach(({ src, likes }) => {
                div.innerHTML += `<img src="${src}" width="500"/><div>${likes} Лайков</div>`;
            });
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


renderMenu();
goToPage(appState.menuElements.feed);
