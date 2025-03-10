import InputComponent from '../UI/InputComponent/InputComponent.js';

export class SearchComponent {
    constructor(container) {
        this.container = container;
    }

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

export class AvatarComponent {
    constructor(container) {
        this.container = container;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('header-right');

        const avatar = document.createElement('img');
        avatar.src = '/static/img/avatar.jpg';
        avatar.classList.add('avatar');

        // const dropdownButton = document.createElement('a');
        // dropdownButton.classList.add('dropdown-button');

        wrapper.appendChild(avatar);
        // wrapper.appendChild(dropdownButton);
        this.container.appendChild(wrapper);
    }
}

export default class HeaderComponent {
    constructor(container, menu) {
        this.container = container;
        this.menu = menu;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('header-inner-wrapper');
        
        new SearchComponent(wrapper).render();
        new AvatarComponent(wrapper).render();

        this.container.appendChild(wrapper);
    }
}
