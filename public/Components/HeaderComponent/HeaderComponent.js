import Ajax from '../../modules/ajax.js';
import InputComponent from '../UI/InputComponent/InputComponent.js';
import ProfileMenuComponent from '../ProfileMenuComponent/ProfileMenuComponent.js';
import AvatarComponent from '../AvatarComponent/AvatarComponent.js';
import router from '../../Router.js';
import createElement from '../../utils/createElement.js';
import { getLsItem } from '../../utils/localStorage.js';


const DEBOUNCE_DELAY = 500;
const REQUEST_USERS_COUNT = 10;


export default class HeaderComponent {
    #parent;
    #left = null;
    #search = null;
    #searchResults = null;
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
        this.#left = createElement({
            parent: this.wrapper,
            classes: ['header__left']
        });

        this.#search = createElement({
            parent: this.#left,
            classes: ['header__search-wrapper']
        });

        const input = new InputComponent(this.#search, {
            type: 'search',
            placeholder: 'Поиск',
            showRequired: false,
            classes: ['header__search']
        });

        input.addListener(() => {
            if (input.value === '') {
                this.#searchResults.innerHTML = '';
                createElement({
                    parent: this.#searchResults,
                    text: 'Ничего не найдено',
                    classes: ['header__result_empty'],
                });
                return;
            }

            input.input.onfocus = () => this.#searchResults.classList.remove('hidden');
            document.addEventListener('mouseup', (e) => {
                if (!this.#search.contains(e.target)) this.#searchResults.classList.add('hidden');
            });
            
            Ajax.get({
                url: '/users/search',
                params: {
                    string: input.value,
                    users_count: REQUEST_USERS_COUNT,
                },
                callback: (status, users) => {
                    switch (status) {
                        case 200:
                            this.cdOk(users);
                            break;
                    }
                }
            });
        }, DEBOUNCE_DELAY);

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

    cdOk(users) {
        if (users.payload.length === 0) return this.#searchResults.innerHTML = '';

        if (!this.#searchResults) {
            this.#searchResults = createElement({
                parent: this.#search,
                classes: ['header__results'],
            });
        }

        this.#searchResults.innerHTML = '';
        
        for (const user of users.payload) {
            createElement({
                tag: 'a',
                parent: this.#searchResults,
                text: `${user.firstname} ${user.lastname}`,
                classes: ['header__result'],
                attrs: { href: `/profiles/${user.username}` },
            });
        }
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
