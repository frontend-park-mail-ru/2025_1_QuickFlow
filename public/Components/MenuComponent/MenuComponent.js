import createElement from '../../utils/createElement.js';


export default class MenuComponent {
    #config
    #parent
    #container
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.#container = null;
        this.activePageLink = null;
        this.menuElements = {};

        this.render();
    }

    render() {
        this.#container = createElement({
            tag: 'aside',
            parent: this.#parent,
            classes: ['menu'],
        });

        new LogoComponent(this.#container, this).render();

        Object.entries(this.#config.menu).forEach(([key, { href, text, icon }], index) => {
            const menuElement = createElement({
                tag: 'a',
                parent: this.#container,
                classes: ['menu__item'],
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
                this.checkAuthPage();
            }
        });
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

    checkAuthPage() {
        const path = this.activePageLink.href;
        const href = path.substr(path.lastIndexOf('/') + 1);
        if (href === 'login' || href === 'signup') {
            this.#parent.classList.add("container_auth");
            return;
        }
        this.#parent.classList.remove("container_auth");
    }

    goToPage(menuElement) {
        this.#parent.querySelector('main').innerHTML = '';
        if (this.activePageLink) this.activePageLink.classList.remove('menu__item_active');

        menuElement.classList.add('menu__item_active');
        this.activePageLink = menuElement;

        const section = menuElement.dataset.section;
        if (this.#config.menu[section].render) {
            const element = this.#config.menu[section].render();
            this.#parent.querySelector('main').appendChild(element);
        }

        this.checkAuthPage();
    }
}


export class LogoComponent {
    #parent
    #menu
    constructor(parent, menu) {
        this.#parent = parent;
        this.#menu = menu;
    }

    render() {
        const wrapper = createElement({
            parent: this.#parent,
            classes: ['menu__logo'],
        });

        createElement({
            parent: wrapper,
            attrs: {src: '/static/img/annotated-logo.svg'}
        });

        wrapper.addEventListener('click', () => this.#menu.goToPage(this.#menu.menuElements.feed));
    }
}
