import Ajax from '../../modules/ajax.js';
import InputComponent from '../UI/InputComponent/InputComponent.js';
import ProfileMenuComponent from '../ProfileMenuComponent/ProfileMenuComponent.js';
import AvatarComponent from '../AvatarComponent/AvatarComponent.js';
import createElement from '../../utils/createElement.js';


export default class HeaderComponent {
    #parent
    #menu
    constructor(parent, menu) {
        this.#parent = parent;
        this.#menu = menu;

        this.rightWrapper = null;
    }

    render() {
        const header = createElement({
            tag: 'header',
            parent: this.#parent,
            classes: ['header']
        });

        this.wrapper = createElement({
            parent: header,
            classes: ['header-inner-wrapper']
        });
        
        this.renderActions();
        this.renderAvatarMenu();
    }

    renderActions() {
        const leftWrapper = createElement({
            parent: this.wrapper,
            classes: ['header-left']
        });

        const searchInput = new InputComponent(leftWrapper, {
            type: 'search',
            placeholder: 'Поиск',
            showRequired: false
        });
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
    }

    renderAvatarMenu() {
        if (this.rightWrapper) {
            this.rightWrapper.innerHTML = '';
        }

        this.rightWrapper = createElement({
            parent: this.wrapper,
            classes: ['header-right']
        });

        Ajax.get({
            url: `/profiles/${this.#menu.username}`,
            callback: (status, userData) => {
                this.renderAvatarCallback(status, userData);
            }
        });
    }

    renderAvatarCallback(status, userData) {
        let isAuthorized = status === 200;

        if (!isAuthorized) {
            this.#menu.goToPage(this.#menu.menuElements.login);
            this.#menu.updateMenuVisibility(false);
            return;
        }

        if (userData) {
            new AvatarComponent(this.rightWrapper, {
                size: 'xs',
                src: userData.avatar,
            });

            createElement({
                tag: 'a',
                parent: this.rightWrapper,
                classes: ['dropdown-button']
            });

            new ProfileMenuComponent(this.rightWrapper, {
                userData,
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
            });
        }
    }
}
