import Ajax from '../../modules/ajax.js';
import InputComponent from '../UI/InputComponent/InputComponent.js';
import ProfileMenuComponent from '../ProfileMenuComponent/ProfileMenuComponent.js';
import AvatarComponent from '../AvatarComponent/AvatarComponent.js';
import router from '../../Router.js';
import createElement from '../../utils/createElement.js';
import { getLsItem } from '../../utils/localStorage.js';


export default class HeaderComponent {
    #parent
    constructor(parent) {
        this.#parent = parent;
        this.rightWrapper = null;
        this.render();
    }

    render() {
        const header = createElement({
            tag: 'header',
            parent: this.#parent,
            classes: ['header']
        });

        this.wrapper = createElement({
            parent: header,
            classes: ['header__inner']
        });
        
        this.renderActions();
        this.renderAvatarMenu();
    }

    renderActions() {
        const leftWrapper = createElement({
            parent: this.wrapper,
            classes: ['header__left']
        });

        new InputComponent(leftWrapper, {
            type: 'search',
            placeholder: 'Поиск',
            showRequired: false,
            classes: ['header__search']
        });

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
        if (this.rightWrapper) this.rightWrapper.innerHTML = '';

        this.rightWrapper = createElement({
            parent: this.wrapper,
            classes: ['header__right']
        });

        Ajax.get({
            url: `/profiles/${getLsItem('username', '')}`,
            callback: (status, userData) => {
                switch (status) {
                    case 200:
                        this.renderAvatarCallback(userData);
                        break;
                }
            }
        });
    }

    renderAvatarCallback(userData) {
        if (userData) {
            new AvatarComponent(this.rightWrapper, {
                size: 'xs',
                src: userData.profile.avatar_url,
            });

            createElement({
                tag: 'a',
                parent: this.rightWrapper,
                classes: ['header__dropdown-icon']
            });

            new ProfileMenuComponent(this.rightWrapper, {
                userData,
                menuItems: {
                    settings: {
                        href: '/settings',
                        text: 'Настройки',
                        icon: 'settings-icon',
                        render: () => router.go({ path: '/profile/edit' }),
                    },
                    help: {
                        href: '/help',
                        text: 'Помощь',
                        icon: 'help-icon',
                        render: () => {},
                    },
                    logout: {
                        href: '/logout',
                        text: 'Выйти',
                        icon: 'logout-icon',
                        render: () => router.go({ path: '/logout' }),
                    },
                },
            });
        }
    }
}
