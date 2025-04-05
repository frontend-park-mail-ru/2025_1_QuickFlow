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
            classes: ['profile-menu-wrapper'],
        });
        
        const topWrapper = createElement({
            parent: this.wrapper,
            classes: ['profile-menu-top-wrapper'],
        });

        new AvatarComponent(topWrapper, {
            size: AVATAR_SIZE,
            src: this.#config.userData.avatar_url,
        });

        const userData = createElement({
            parent: topWrapper,
            classes: ['profile-menu-user-info'],
        });

        createElement({
            parent: userData,
            classes: ['profile-menu-name'],
            text: `${this.#config.userData.firstname} ${this.#config.userData.lastname}`
        });

        createElement({
            parent: userData,
            classes: ['profile-menu-username'],
            text: `${USERNAME_PREFIX}${this.#config.userData.username}`
        });

        const menuItems = createElement({
            parent: this.wrapper,
            classes: ['profile-menu-items'],
        });

        Object.entries(this.#config.menuItems).forEach(([, { href, text, icon }],) => {
            const menuItem = createElement({
                tag: 'a',
                parent: menuItems,
                classes: ['profile-menu-item'],
                attrs: {href}
            });
            createElement({
                parent: menuItem,
                classes: ['profile-menu-icon'],
                attrs: {src: `/static/img/${icon}.svg`}
            });
            createElement({
                parent: menuItem,
                classes: ['profile-menu-item-text'],
                text
            });
        });
    }
}
