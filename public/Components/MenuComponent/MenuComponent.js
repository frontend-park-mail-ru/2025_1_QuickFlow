export class LogoComponent {
    #container;
    #menu;

    constructor(container, menu) {
        this.#container = container;
        this.#menu = menu;
    }

    render() {
        const template = Handlebars.templates['LogoComponent.hbs'];
        const logoHTML = template();

        this.#container.insertAdjacentHTML('beforeend', logoHTML);

        const wrapper = this.#container.querySelector('.header-logo-wrapper');
        wrapper.addEventListener('click', (event) => {
            event.preventDefault();
            this.#menu.goToPage(this.#menu.menuElements.feed);
        });
    }
}

export default class MenuComponent {
    #config;
    #container;
    menuElements = {};
    activePageLink = null;

    constructor(config, container) {
        this.#config = config;
        this.#container = container;
    }

    render() {
        new LogoComponent(this.#container, this).render();

        const template = Handlebars.templates['MenuComponent.hbs'];
        const menuHTML = template({
            menuItems: Object.entries(this.#config.menu).map(([key, { href, text, icon }]) => ({
                key,
                href,
                text,
                icon
            }))
        });

        this.#container.insertAdjacentHTML('beforeend', menuHTML);

        this.#container.querySelectorAll('.menu-item').forEach((menuElement, index) => {
            const key = menuElement.dataset.section;
            this.menuElements[key] = menuElement;

            if (index === 0) {
                menuElement.classList.add('active');
                this.activePageLink = menuElement;
            }
        });

        this.#container.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link) {
                event.preventDefault();
                this.goToPage(link);
            }
        });
    }

    goToPage(menuElement) {
        document.querySelector('main').innerHTML = '';
        if (this.activePageLink) {
            this.activePageLink.classList.remove('active');
        }
        menuElement.classList.add('active');
        this.activePageLink = menuElement;

        const section = menuElement.dataset.section;
        if (this.#config.menu[section]?.render) {
            const element = this.#config.menu[section].render();
            document.querySelector('main').appendChild(element);
        }
    }
}
