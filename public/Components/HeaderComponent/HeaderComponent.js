import InputComponent from '../UI/InputComponent/InputComponent.js';
import ProfileMenuComponent from '../ProfileMenuComponent/ProfileMenuComponent.js';

/**
 * Компонент поиска в шапке сайта.
 */
export class SearchComponent {
    /**
     * @param {HTMLElement} container - Родительский контейнер, в который будет добавлен компонент.
     */
    constructor(container) {
        this.container = container;
    }

    /**
     * Рендерит компонент поиска и добавляет его в контейнер.
     */
    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('header-left');

        const searchInput = new InputComponent(wrapper, {
            type: 'search',
            placeholder: 'Поиск',
            showRequired: false
        });

        searchInput.render();
        searchInput.input.classList.add('header-search');

        // const notificationsWrapper = document.createElement('a');
        // notificationsWrapper.classList.add('icon-wrapper');
        // const musicWrapper = document.createElement('a');
        // musicWrapper.classList.add('icon-wrapper');

        // const notificationsIcon = document.createElement('img');
        // notificationsIcon.src = '/static/img/notice-icon.svg';

        // const musicIcon = document.createElement('img');
        // musicIcon.src = '/static/img/music-icon-top.svg';
        
        // notificationsWrapper.appendChild(notificationsIcon);
        // musicWrapper.appendChild(musicIcon);

        // wrapper.appendChild(notificationsWrapper);
        // wrapper.appendChild(musicWrapper);

        this.container.appendChild(wrapper);
    }
}

/**
 * Компонент аватара в шапке сайта.
 */
export class AvatarComponent {
    /**
     * @param {HTMLElement} container - Родительский контейнер, в который будет добавлен компонент.
     */
    constructor(container) {
        this.container = container;
    }

    /**
     * Рендерит компонент аватара и добавляет его в контейнер.
     */
    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('header-right');

        const avatar = document.createElement('img');
        avatar.src = '/static/img/avatar.jpg';
        avatar.classList.add('avatar');

        const dropdownButton = document.createElement('a');
        dropdownButton.classList.add('dropdown-button');

        wrapper.appendChild(avatar);
        wrapper.appendChild(dropdownButton);

        new ProfileMenuComponent(wrapper, {
            data: {
                name: 'Роман Васютенко',
                username: 'rvasutenko',
                menuItems: {
                    settings: {
                        href: '/settings',
                        text: 'Настройки',
                        icon: 'settings-icon'
                    },
                    help: {
                        href: '/help',
                        text: 'Помощь',
                        icon: 'help-icon'
                    },
                    logout: {
                        href: '/logout',
                        text: 'Выйти',
                        icon: 'logout-icon'
                    },
                },
            }
        });

        this.container.appendChild(wrapper);
    }
}

/**
 * Компонент шапки сайта, включающий поиск и аватар.
 */
export default class HeaderComponent {
    /**
     * @param {HTMLElement} container - Родительский контейнер, в который будет добавлен компонент.
     * @param {Object} menu - Объект меню для взаимодействия с шапкой.
     */
    constructor(container, menu) {
        this.container = container;
        this.wrapper = document.createElement('header');
        this.wrapper.classList.add('header');
        this.container.appendChild(this.wrapper);
        this.menu = menu;
    }

    /**
     * Рендерит шапку сайта, добавляя в неё поиск и аватар.
     */
    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('header-inner-wrapper');
        
        new SearchComponent(wrapper).render();
        new AvatarComponent(wrapper).render();

        this.wrapper.appendChild(wrapper);
    }
}
