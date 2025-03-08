// import Handlebars from 'handlebars';

export class LogoComponent {
    constructor(container, menu) {
        this.container = container;
        this.menu = menu;
    }

    render() {
        const wrapper = document.createElement('a');
        wrapper.classList.add('header-logo-wrapper');
        wrapper.href = '/feed';

        const logo = document.createElement('img');
        logo.classList.add('header-logo');
        logo.src = '/static/img/annotated-logo.svg';

        wrapper.appendChild(logo);
        this.container.appendChild(wrapper);

        wrapper.addEventListener('click', (event) => {
            event.preventDefault();
            this.menu.goToPage(this.menu.menuElements.feed);
        });
    }
}

export default class MenuComponent {
    constructor(config, container) {
        this.config = config;
        this.container = container;
        this.menuElements = {};
        this.activePageLink = null;
    }

    render() {
        new LogoComponent(this.container, this).render();

        Object.entries(this.config.menu).forEach(([key, { href, text, icon }], index) => {
            const menuElement = document.createElement('a');
            menuElement.href = href;
            menuElement.classList.add('menu-item');

            const iconElement = document.createElement('img');
            iconElement.src = `/static/img/${icon}.svg`;
            iconElement.classList.add('menu-icon');

            menuElement.appendChild(iconElement);
            menuElement.appendChild(document.createTextNode(` ${text}`));
            menuElement.dataset.section = key;

            if (index === 0) {
                menuElement.classList.add('active');
                this.activePageLink = menuElement;
            }

            this.menuElements[key] = menuElement;
            this.container.appendChild(menuElement);
        });

        this.container.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                event.preventDefault();
                this.goToPage(event.target.closest('a'));
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
        if (this.config.menu[section].render) {
            const element = this.config.menu[section].render();
            document.querySelector('main').appendChild(element);
        }
    }
}
