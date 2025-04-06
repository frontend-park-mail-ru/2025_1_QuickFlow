import AvatarComponent from '../AvatarComponent/AvatarComponent.js';
import createElement from '../../utils/createElement.js';


const AVATAR_SIZE = 'xl';
const USERNAME_PREFIX = '@';


export default class ProfileMenuComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#config = config;
        this.#parent = parent;
        
        this.wrapper = null;
        this.render();
    }

    render() {
        this.wrapper = createElement({
            parent: this.#parent,
            classes: ['profile-menu'],
        });
        
        const topWrapper = createElement({
            parent: this.wrapper,
            classes: ['profile-menu__info'],
        });

        new AvatarComponent(topWrapper, {
            size: AVATAR_SIZE,
            src: this.#config.userData.avatar_url,
        });

        const userData = createElement({
            parent: topWrapper,
            classes: ['profile-menu__profile-info'],
        });

        createElement({
            parent: userData,
            classes: ['profile-menu__name'],
            text: `${this.#config.userData.firstname} ${this.#config.userData.lastname}`
        });

        createElement({
            parent: userData,
            classes: ['profile-menu__username'],
            text: `${USERNAME_PREFIX}${this.#config.userData.username}`
        });

        const menuItems = createElement({
            parent: this.wrapper,
            classes: ['profile-menu__items'],
        });

        Object.entries(this.#config.menuItems).forEach(([key, { href, text, icon }],) => {
            const menuItem = createElement({
                tag: 'a',
                parent: menuItems,
                classes: ['profile-menu__item'],
                attrs: {href}
            });
            createElement({
                parent: menuItem,
                attrs: {src: `/static/img/${icon}.svg`}
            });
            createElement({
                parent: menuItem,
                text
            });

            menuItem.addEventListener('click', (event) => {
                event.preventDefault();
                this.#config.menuItems[key].render();
            });
        });
    }
}
