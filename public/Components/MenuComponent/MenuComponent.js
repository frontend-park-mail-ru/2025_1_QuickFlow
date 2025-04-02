import createElement from '../../utils/createElement.js';

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
            classes: ['header-logo-wrapper'],
        });

        createElement({
            parent: wrapper,
            classes: ['header-logo'],
            attrs: {src: '/static/img/annotated-logo.svg'}
        });

        wrapper.addEventListener('click', () => this.#menu.goToPage(this.#menu.menuElements.feed));
    }
}

export default class MenuComponent {
    #config
    #parent
    constructor(container, config) {
        this.#parent = container;
        this.#config = config;

        this.activePageLink = null;
        this.menuElements = {};
    }

    render() {
        new LogoComponent(this.#parent, this).render();

        Object.entries(this.#config.menu).forEach(([key, { href, text, icon }], index) => {
            const menuElement = createElement({
                tag: 'a',
                parent: this.#parent,
                classes: ['menu-item'],
                attrs: {href, 'data-section': key}
            });

            createElement({
                parent: menuElement,
                classes: ['menu-icon'],
                attrs: {src: `/static/img/${icon}.svg`}
            });

            createElement({
                parent: menuElement,
                text
            });

            if (index === 0) {
                menuElement.classList.add('active');
                this.activePageLink = menuElement;
            }

            // if (this.isUserLoggedIn() && (key === 'login' || key === 'signup')) {
            //     iconElement.classList.add('hidden');
            // } else if (!this.isUserLoggedIn() && (key === 'logout')) {
            //     iconElement.classList.add('hidden');
            // }

            this.menuElements[key] = menuElement;
        });

        this.updateMenuVisibility(this.#config.isAuthorized);

        this.#parent.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                event.preventDefault();
                this.goToPage(event.target.closest('a'));
                this.checkAuthPage();
            }
        });
    }

    updateMenuVisibility(isAuthorized) {
        if (this.menuElements.login) {
            this.menuElements.login.style.display = isAuthorized ? 'none' : 'flex';
        }
        if (this.menuElements.signup) {
            this.menuElements.signup.style.display = isAuthorized ? 'none' : 'flex';
        }
        if (this.menuElements.logout) {
            this.menuElements.logout.style.display = isAuthorized ? 'flex' : 'none';
        }
    }

    checkAuthPage() {
        const path = this.activePageLink.href;
        const href = path.substr(path.lastIndexOf('/') + 1);
        if (href === 'login' || href === 'signup') {
            document.body.classList.add("hide-interface");
        } else {
            document.body.classList.remove("hide-interface");
        }
    }

    goToPage(menuElement) {
        document.querySelector('main').innerHTML = '';
        if (this.activePageLink) {
            this.activePageLink.classList.remove('active');
        }

        menuElement.classList.add('active');
        this.activePageLink = menuElement;

        const section = menuElement.dataset.section;
        if (this.#config.menu[section].render) {
            const element = this.#config.menu[section].render();
            document.querySelector('main').appendChild(element);
        }

        this.checkAuthPage();
    }
}
