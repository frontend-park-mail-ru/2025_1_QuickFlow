import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';
import { getLsItem } from '@utils/localStorage';
import router from '@router';
import { FriendsRequests } from '@modules/api';
import CounterComponent from '@components/CounterComponent/CounterComponent';
import { MOBILE_MAX_WIDTH } from '@config/config';
import LsProfile from '@modules/LsProfile';


const LOGO = 'annotated-logo';


export default class MenuComponent {
    static __instance: MenuComponent;
    private config: Record<string, any>;
    private parent: HTMLElement;

    private isMobile: boolean;
    container: HTMLElement | null = null;
    menuElements: Record<string, any> = {};
    activePageLink: HTMLElement = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        if (MenuComponent.__instance) {
            return MenuComponent.__instance;
        }

        this.parent = parent;
        this.config = config;
        this.isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
        this.render();

        MenuComponent.__instance = this;
    }

    async renderLogo() {
        const logo = await insertIcon(this.container, {
            name: LOGO,
            classes: ['menu__logo'],
        });

        logo.addEventListener('click', () => this.goToPage(this.menuElements.feed));
    }

    render() {
        this.container = createElement({
            tag: 'aside',
            parent: this.parent,
            classes: ['menu'],
        });

        this.renderLogo();

        Object.entries(this.config.menu).forEach(([key, option], index) => {
            const { href, text, icon, onClick } = option as { href?: string; text: string; icon?: string; onClick?: any };
            
            const menuElement = createElement({
                tag: 'a',
                parent: this.container,
                classes: [
                    'menu__item',
                    key === 'profiles' ? 'js-profile-menu-item' : 'menu__item'
                ],
                attrs: {'data-section': key}
            });

            if (href) {
                menuElement.setAttribute('href', href);
            }

            const itemLeft = createElement({
                parent: menuElement,
                classes: ['menu__item-left'],
            });

            insertIcon(itemLeft, {
                name: icon,
                classes: ['menu__icon'],
            }).then((menuIcon) => {
                if (this.isMobile) {
                    menuElement.addEventListener('click', (e) => {
                        menuIcon.classList.remove('menu__icon-animating');
                        void menuIcon.offsetWidth;

                        menuIcon.classList.add('menu__icon-animating');
                        menuIcon.addEventListener('animationend', () => {
                            menuIcon.classList.remove('menu__icon-animating');
                        }, { once: true });
                    });   
                }
            });

            createElement({
                parent: itemLeft,
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

        this.container?.addEventListener('click', (event: any) => {
            if (event?.target?.closest('a')) {
                event.preventDefault();
                this.goToPage(event.target.closest('a'));
            }
        });

        this.renderCounters();
    }

    public async renderCounters() {
        const userId = LsProfile.id;

        const [status, friendsData] = await FriendsRequests.getFriends(userId, 100, 0, 'incoming');
        switch (status) {
            case 401:
                router.go({ path: '/login' });
                return;
        }

        const requestsCount = friendsData?.payload?.friends?.length;
        if (requestsCount) {
            this.menuElements.friends.querySelector('.menu__counter')?.remove();
            new CounterComponent(this.menuElements.friends, {
                value: requestsCount,
                classes: ['menu__counter'],
            });
        }
    }

    public renderProfileMenuItem() {
        const profileMenuItem = this.container?.getElementsByClassName('js-profile-menu-item')[0] as HTMLAnchorElement | undefined;
        if (profileMenuItem) {
            profileMenuItem.href = `/profiles/${LsProfile.username}`;
        }
    }

    updateMenuVisibility() {
        if (this.config.isAuthorized) {
            this.menuElements.login.classList.add('hidden');
            this.menuElements.signup.classList.add('hidden');
            return;
        }
        this.menuElements.login.classList.remove('hidden');
        this.menuElements.signup.classList.remove('hidden');
    }

    setActive(section: string) {
        const menuElement = this.menuElements[section];
        if (this.activePageLink) {
            this.activePageLink.classList.remove('menu__item_active');
        }
        menuElement.classList.add('menu__item_active');
        this.activePageLink = menuElement;
    }

    goToPage(menuElement: HTMLElement) {
        if (
            menuElement.getAttribute('href') === router.path.split('?')[0] &&
            // menuElement.dataset.section === router.path.slice(1) &&
            this.activePageLink.getAttribute('href')
        ) return;

        this.setActive(menuElement.dataset.section);
        if (!menuElement.getAttribute('href')) return;
        
        router.go({ path: menuElement.getAttribute('href') });
    }
}
