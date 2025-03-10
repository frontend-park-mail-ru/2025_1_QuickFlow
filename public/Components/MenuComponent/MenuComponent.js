// import Handlebars from 'handlebars';

export class LogoComponent {
    constructor(container, menu) {
        this.container = container;
        this.menu = menu;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('header-logo-wrapper');

        const logo = document.createElement('img');
        logo.classList.add('header-logo');
        logo.src = '/static/img/annotated-logo.svg';

        wrapper.appendChild(logo);
        this.container.appendChild(wrapper);

        // wrapper.addEventListener('click', (event) => {
        //     event.preventDefault();
        //     this.menu.goToPage(this.menu.menuElements.feed);
        //     this.menu.checkAuthPage();
        // });
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

            // if (this.isUserLoggedIn() && (key === 'login' || key === 'signup')) {
            //     iconElement.classList.add('hidden');
            // } else if (!this.isUserLoggedIn() && (key === 'logout')) {
            //     iconElement.classList.add('hidden');
            // }

            this.menuElements[key] = menuElement;
            this.container.appendChild(menuElement);
        });

        this.updateMenuVisibility();

        this.container.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                event.preventDefault();
                this.goToPage(event.target.closest('a'));
                this.checkAuthPage();
            }
        });
    }

    isUserLoggedIn() {
        console.log(document.cookie.split(';'));
        console.log(document.cookie.split(';').some(cookie => cookie.trim().startsWith('session=')));
        return document.cookie.split(';').some(cookie => cookie.trim().startsWith('session='));
    }

    updateMenuVisibility() {
        const isLoggedIn = this.isUserLoggedIn();

        if (this.menuElements.login) {
            this.menuElements.login.style.display = isLoggedIn ? 'none' : 'flex';
        }
        if (this.menuElements.signup) {
            this.menuElements.signup.style.display = isLoggedIn ? 'none' : 'flex';
        }
        if (this.menuElements.logout) {
            this.menuElements.logout.style.display = isLoggedIn ? 'flex' : 'none';
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
        if (this.config.menu[section].render) {
            const element = this.config.menu[section].render();
            document.querySelector('main').appendChild(element);
        }
    }
}
