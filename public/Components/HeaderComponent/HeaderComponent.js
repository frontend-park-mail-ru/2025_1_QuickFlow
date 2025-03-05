console.log("HeaderComponent.js загружен!");

export class LogoComponent {
    constructor(container, menu) {
        this.container = container;
        this.menu = menu;
    }

    render() {
        const logo = document.createElement('a');
        logo.href = '/feed';
        logo.classList.add('logo-item');

        const iconElement = document.createElement('img');
        iconElement.src = `/static/img/logo-icon.svg`;

        const nameElement = document.createElement('img');
        nameElement.src = `/static/img/quickFlow-icon.svg`;

        logo.appendChild(iconElement);
        logo.appendChild(nameElement);
        this.container.appendChild(logo);

        logo.addEventListener('click', (event) => {
            event.preventDefault();
            this.menu.goToPage(this.menu.menuElements.feed);
        });
    }
}

export class SearchComponent {
    constructor(container) {
        this.container = container;
    }

    render() {
        const searchContainer = document.createElement('a');
        searchContainer.classList.add('search-container');
        searchContainer.href = '/feed'; // Временная заглушка

        const search = document.createElement('input');
        search.classList.add('search-item');
        search.setAttribute('type', 'text');
        search.setAttribute('placeholder', 'Поиск');

        const icon = document.createElement('img');
        icon.src = '/static/img/search-icon.svg';
        icon.classList.add('search-icon');

        const iconContainer = document.createElement('a');
        iconContainer.classList.add('search-icon-container');

        const noticeIcon = document.createElement('img');
        noticeIcon.src = '/static/img/notice-icon.svg';
        noticeIcon.classList.add('notice-icon');

        const musicIcon = document.createElement('img');
        musicIcon.src = '/static/img/music-icon-top.svg';
        musicIcon.classList.add('music-icon-top');

        searchContainer.appendChild(icon);
        searchContainer.appendChild(search);

        iconContainer.appendChild(noticeIcon);
        iconContainer.appendChild(musicIcon);

        this.container.appendChild(searchContainer);
        this.container.appendChild(iconContainer);
    }
}

export class AvatarComponent {
    constructor(container) {
        this.container = container;
    }

    render() {
        const avatarContainer = document.createElement('div');
        avatarContainer.classList.add('avatar-container');

        const avatar = document.createElement('img');
        avatar.src = '/static/img/avatar.jpg';
        avatar.classList.add('avatar');

        const dropdownButton = document.createElement('button');
        dropdownButton.classList.add('dropdown-button');
        dropdownButton.innerHTML = '&#9662;';

        avatarContainer.appendChild(avatar);
        avatarContainer.appendChild(dropdownButton);
        this.container.appendChild(avatarContainer);
    }
}

export default class HeaderComponent {
    constructor(container, menu) {
        this.container = container;
        this.menu = menu;
    }

    render() {
        new LogoComponent(this.container, this.menu).render();
        new SearchComponent(this.container).render();
        new AvatarComponent(this.container).render();
    }
}
