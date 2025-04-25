import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';
import { getLsItem } from '@utils/localStorage';
import router from '@router';


const LOGO_SRC = '/static/img/annotated-logo.svg';
const LOGO = 'annotated-logo';


export default class MenuComponent {
    static __instance: MenuComponent;
    #config
    #parent
    #container: HTMLElement | null = null;
    menuElements: Record<string, any> = {};
    activePageLink: any = null;
    constructor(parent: HTMLElement, config: any) {
        if (MenuComponent.__instance) {
            return MenuComponent.__instance;
        }

        this.#parent = parent;
        this.#config = config;
        this.render();

        MenuComponent.__instance = this;
    }

    async renderLogo() {
        // const logo = createElement({
        //     parent: this.#container,
        //     classes: ['logo'],
        // });

        // createElement({
        //     parent: logo,
        //     attrs: {src: LOGO_SRC}
        // });

        const logo = await insertIcon(this.#container, {
            name: LOGO,
            classes: ['menu__logo'],
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

        Object.entries(this.#config.menu).forEach(([key, option], index) => {
            const { href, text, icon, onClick } = option as { href?: string; text: string; icon?: string; onClick?: any };
            
            const menuElement = createElement({
                tag: 'a',
                parent: this.#container,
                classes: [
                    'menu__item',
                    key === 'profiles' ? 'js-profile-menu-item' : 'menu__item'
                ],
                attrs: {'data-section': key}
            });

            if (href) menuElement.setAttribute('href', href);

            insertIcon(menuElement, {
                name: icon,
                classes: ['menu__icon'],
            });

            createElement({
                parent: menuElement,
                text,
                classes: ['menu__text'],
            });

            if (index === 0) {
                menuElement.classList.add('menu__item_active');
                this.activePageLink = menuElement;
            }

            if (onClick) {
                menuElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    onClick();
                });
            }

            this.menuElements[key] = menuElement;
        });

        this.updateMenuVisibility();

        this.#container?.addEventListener('click', (event: any) => {
            if (event?.target?.closest('a')) {
                event.preventDefault();
                this.goToPage(event.target.closest('a'));
            }
        });
    }

    renderProfileMenuItem() {
        const profileMenuItem = this.#container?.getElementsByClassName('js-profile-menu-item')[0] as HTMLAnchorElement | undefined;
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

    setActive(section: any) {
        const menuElement = this.menuElements[section];
        if (this.activePageLink) {
            this.activePageLink.classList.remove('menu__item_active');
        }
        menuElement.classList.add('menu__item_active');
        this.activePageLink = menuElement;
    }

    goToPage(menuElement: HTMLElement) {
        if (
            menuElement.getAttribute('href') === router.path &&
            // menuElement.dataset.section === router.path.slice(1) &&
            this.activePageLink.getAttribute('href')
        ) return;

        this.setActive(menuElement.dataset.section);
        if (!menuElement.getAttribute('href')) return;
        
        router.go({ path: menuElement.getAttribute('href') });
    }
}
