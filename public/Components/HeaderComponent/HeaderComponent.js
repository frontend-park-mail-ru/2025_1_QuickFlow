import Ajax from '../../modules/ajax.js';
import InputComponent from '../UI/InputComponent/InputComponent.js';
import ProfileMenuComponent from '../ProfileMenuComponent/ProfileMenuComponent.js';
import AvatarComponent from '../AvatarComponent/AvatarComponent.js';

export default class HeaderComponent {
    #parent
    #menu
    constructor(parent, menu) {
        this.#parent = parent;
        this.#menu = menu;

        console.log(this.#menu); // for linter
    }

    render() {
        const header = document.createElement('header');
        header.classList.add('header');
        this.#parent.appendChild(header);

        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('header-inner-wrapper');
        
        this.renderActions();
        this.renderAvatarMenu();
        
        header.appendChild(this.wrapper);
    }

    renderActions() {
        const leftWrapper = document.createElement('div');
        leftWrapper.classList.add('header-left');

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

        this.wrapper.appendChild(leftWrapper);
    }

    renderAvatarMenu() {
        const rightWrapper = document.createElement('div');
        rightWrapper.classList.add('header-right');
        this.wrapper.appendChild(rightWrapper);

        // const avatar = document.createElement('img');
        // avatar.src = '/static/img/avatar.jpg';
        // avatar.classList.add('avatar');

        Ajax.get({
            url: '/user-info',
            // params: {
            //     target: 'avatar',
            // },
            callback: (status, userInfo) => {
                let isAuthorized = status === 200;

                if (!isAuthorized) {
                    this.#menu.goToPage(this.#menu.menuElements.login);
                    this.#menu.updateMenuVisibility(false);
                    return;
                }

                if (userInfo) {
                    new AvatarComponent(rightWrapper, {
                        size: 'xs',
                        src: userInfo.avatar,
                    });

                    const dropdownButton = document.createElement('a');
                    dropdownButton.classList.add('dropdown-button');

                    rightWrapper.appendChild(dropdownButton);

                    new ProfileMenuComponent(rightWrapper, {
                        userInfo,
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
        });
    }
}
