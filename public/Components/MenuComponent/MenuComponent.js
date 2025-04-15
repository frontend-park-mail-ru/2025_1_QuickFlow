import createElement from '../../utils/createElement.js';
import { getLsItem } from '../../utils/localStorage.js';
import router from '../../Router.js';


const LOGO_SRC = '/static/img/annotated-logo.svg';


export default class MenuComponent {
    #config
    #parent
    #container
    constructor(parent, config) {
        if (MenuComponent.__instance) {
            return MenuComponent.__instance;
        }

        this.#parent = parent;
        this.#config = config;
        this.#container = null;
        this.activePageLink = null;
        this.menuElements = {};
        this.render();

        MenuComponent.__instance = this;
    }

    renderLogo() {
        const logo = createElement({
            parent: this.#container,
            classes: ['menu__logo'],
        });

        createElement({
            parent: logo,
            attrs: {src: LOGO_SRC}
        });

        logo.addEventListener('click', () => this.goToPage(this.menuElements.feed));
    }

    render() {
        this.#container = createElement({
            tag: 'aside',
            parent: this.#parent,
            classes: ['menu'],
        });

        this.renderLogo();

        Object.entries(this.#config.menu).forEach(([key, { href, text, icon }], index) => {
            const menuElement = createElement({
                tag: 'a',
                parent: this.#container,
                classes: [
                    'menu__item',
                    key === 'profiles' ? 'js-profile-menu-item' : 'menu__item'
                ],
                attrs: {href, 'data-section': key}
            });

            createElement({
                parent: menuElement,
                classes: ['menu__icon'],
                attrs: {src: `/static/img/${icon}.svg`}
            });

            createElement({
                parent: menuElement,
                text
            });

            if (index === 0) {
                menuElement.classList.add('menu__item_active');
                this.activePageLink = menuElement;
            }

            this.menuElements[key] = menuElement;
        });

        this.updateMenuVisibility();

        this.#container.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                event.preventDefault();
                this.goToPage(event.target.closest('a'));
            }
        });
    }

    renderProfileMenuItem() {
        const profileMenuItem = this.#container.getElementsByClassName('js-profile-menu-item')[0];
        if (profileMenuItem) {
            profileMenuItem.href = `/profiles/${getLsItem('username', '')}`;
        }
    }

    updateMenuVisibility() {
        if (this.#config.isAuthorized) {
            this.menuElements.login.classList.add('hidden');
            this.menuElements.signup.classList.add('hidden');
            return;
        }
        this.menuElements.login.classList.remove('hidden');
        this.menuElements.signup.classList.remove('hidden');
    }

    setActive(section) {
        const menuElement = this.menuElements[section];
        if (this.activePageLink) {
            this.activePageLink.classList.remove('menu__item_active');
        }
        menuElement.classList.add('menu__item_active');
        this.activePageLink = menuElement;
    }

    goToPage(menuElement) {
        if (menuElement.dataset.section === router.path.slice(1)) return;

        this.setActive(menuElement.dataset.section);
        router.go({ path: menuElement.getAttribute('href') });
    }
}
