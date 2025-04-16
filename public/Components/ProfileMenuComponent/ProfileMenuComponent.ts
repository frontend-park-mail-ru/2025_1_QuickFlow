import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import createElement from '@utils/createElement';


const AVATAR_SIZE = 'xl';
const USERNAME_PREFIX = '@';


export default class ProfileMenuComponent {
    #parent
    #config
    wrapper: HTMLElement | null = null;
    constructor(parent: any, config: any) {
        this.#config = config;
        this.#parent = parent;
        
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
            src: this.#config.userData.profile.avatar_url,
        });

        const userData = createElement({
            parent: topWrapper,
            classes: ['profile-menu__profile-info'],
        });

        createElement({
            parent: userData,
            classes: ['profile-menu__name'],
            text: `${this.#config.userData.profile.firstname} ${this.#config.userData.profile.lastname}`
        });

        createElement({
            parent: userData,
            classes: ['profile-menu__username'],
            text: `${USERNAME_PREFIX}${this.#config.userData.profile.username}`
        });

        const menuItems = createElement({
            parent: this.wrapper,
            classes: ['profile-menu__items'],
        });

        Object.entries(this.#config.menuItems).forEach(([key, option]: [string, any]) => {
            const { href, text, icon } = option;

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

            menuItem.addEventListener('click', (event: any) => {
                event.preventDefault();
                this.#config.menuItems[key].render();
            });
        });
    }
}
