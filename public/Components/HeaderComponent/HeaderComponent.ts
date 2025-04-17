import Ajax from '@modules/ajax';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import ProfileMenuComponent from '@components/ProfileMenuComponent/ProfileMenuComponent';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import router from '@router';
import createElement from '@utils/createElement';
import { getLsItem } from '@utils/localStorage';


const DEBOUNCE_DELAY = 500;
const REQUEST_USERS_COUNT = 10;


export default class HeaderComponent {
    #parent;
    #left: HTMLElement | null = null;
    #search: HTMLElement | null = null;
    #searchResults: HTMLElement | null = null;
    wrapper: HTMLElement | null = null;
    rightWrapper: HTMLElement | null = null;
    constructor(parent: any) {
        this.#parent = parent;

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
            if (input.value === '') return this.showNotFound();

            if (input.input) {
                input.input.onfocus = () => {
                    if (!this.#searchResults) return;
                    this.#searchResults.classList.remove('hidden');
                }
            }

            document.addEventListener('mouseup', (event) => {
                if (!this.#search || !this.#searchResults) return;

                const target = event.target as Node;

                if (!this.#search.contains(target)) {
                    this.#searchResults.classList.add('hidden');
                }
            });

            Ajax.get({
                url: '/users/search',
                params: {
                    string: input.value,
                    users_count: REQUEST_USERS_COUNT,
                },
                callback: (status: number, users: any) => {
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

    showNotFound() {
        if (!this.#searchResults) return;

        this.#searchResults.innerHTML = '';
        createElement({
            parent: this.#searchResults,
            text: 'Ничего не найдено',
            classes: ['header__result_empty'],
        });
    }

    cdOk(users: any) {
        if (!this.#searchResults) {
            this.#searchResults = createElement({
                parent: this.#search,
                classes: ['header__results'],
            });
        }

        if (
            !users ||
            !users.payload ||
            users.payload.length === 0
        ) return this.showNotFound();

        if (this.#searchResults) this.#searchResults.innerHTML = '';
        
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
            callback: (status: number, userData: any) => {
                switch (status) {
                    case 200:
                        this.renderAvatarCallback(userData);
                        break;
                }
            }
        });
    }

    renderAvatarCallback(userData: any) {
        if (userData && this.rightWrapper) {
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
                    // help: {
                    //     href: '/help',
                    //     text: 'Помощь',
                    //     icon: 'help-icon',
                    //     render: () => {},
                    // },
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
