import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import createElement from '@utils/createElement';
import router from '@router';
import ThemeManager from '@modules/ThemeManager';
import ContextMenuComponent from '@components/ContextMenuComponent/ContextMenuComponent';
import insertIcon from '@utils/insertIcon';
import { User } from 'types/UserTypes';


const AVATAR_SIZE = 'xl';
const USERNAME_PREFIX = '@';

const MENU_ITEMS = {
    settings: {
        href: '/settings',
        text: 'Настройки',
        icon: 'settings-icon',
        render: () => router.go({ path: '/profile/edit' }),
    },
    stats: {
        href: '/stats',
        text: 'Статистика',
        icon: 'stats-icon',
        render: () => router.go({ path: '/stats' }),
    },
    theme: {},
    logout: {
        href: '/logout',
        text: 'Выйти',
        icon: 'logout-icon',
        render: () => router.go({ path: '/logout' }),
    },
};


interface ProfileMenuConfig {
    userData: User;
}


export default class ProfileMenuComponent {
    private parent: HTMLElement;
    private config: ProfileMenuConfig;

    private menuItems: HTMLElement;
    private wrapper: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: ProfileMenuConfig) {
        this.config = config;
        this.parent = parent;
        this.render();
    }

    render() {
        this.wrapper = createElement({
            parent: this.parent,
            classes: ['profile-menu'],
        });
        
        const topWrapper = createElement({
            parent: this.wrapper,
            classes: ['profile-menu__info'],
        });

        new AvatarComponent(topWrapper, {
            size: AVATAR_SIZE,
            src: this.config.userData.profile.avatar_url,
        });

        const userData = createElement({
            parent: topWrapper,
            classes: ['profile-menu__profile-info'],
        });

        createElement({
            parent: userData,
            classes: ['profile-menu__name'],
            text: `${this.config.userData.profile.firstname} ${this.config.userData.profile.lastname}`
        });

        createElement({
            parent: userData,
            classes: ['profile-menu__username'],
            text: `${USERNAME_PREFIX}${this.config.userData.profile.username}`
        });

        this.menuItems = createElement({
            parent: this.wrapper,
            classes: ['profile-menu__items'],
        });

        Object.entries(MENU_ITEMS).forEach(([key, option]: [string, any]) => {
            if (key === 'theme') return this.renderThemeSwitcher();
            const { href, text, icon } = option;

            const menuItem = createElement({
                tag: 'a',
                parent: this.menuItems,
                classes: ['profile-menu__item'],
                attrs: {href}
            });

            insertIcon(menuItem, {
                name: icon,
                classes: ['profile-menu__icon'],
            });

            createElement({
                parent: menuItem,
                text
            });

            menuItem.addEventListener('click', (event: any) => {
                event.preventDefault();
                MENU_ITEMS[key].render();
            });
        });
    }

    private renderThemeSwitcher() {
        const menuItem = createElement({
            tag: 'a',
            parent: this.menuItems,
            classes: ['profile-menu__item'],
        });

        insertIcon(menuItem, {
            name: "palette-icon",
            classes: ['profile-menu__icon'],
        });

        const text = createElement({
            parent: menuItem,
            text: `Тема: ${ThemeManager.theme}`,
        });

        const dropdown = createElement({
            parent: menuItem,
            classes: ['profile-menu__dropdown'],
        });

        new ContextMenuComponent(dropdown, {
            size: 'mini',
            data: {
                system: {
                    text: 'Системная',
                    onClick: () => {
                        ThemeManager.resetToAuto();
                        text.innerText = `Тема: ${ThemeManager.theme}`;
                    },
                },
                light: {
                    text: 'Светлая',
                    onClick: () => {
                        ThemeManager.setTheme('light');
                        text.innerText = `Тема: ${ThemeManager.theme}`;
                    },
                },
                dark: {
                    text: 'Тёмная',
                    onClick: () => {
                        ThemeManager.setTheme('dark');
                        text.innerText = `Тема: ${ThemeManager.theme}`;
                    },
                },
            },
        });

        menuItem.addEventListener('mouseenter', (event: any) => {
        });

        // createElement({
        //     tag: 'button',
        //     parent: this.menuItems,
        //     classes: ['theme-switcher'],
        //     attrs: { id: 'theme-light' },
        //     text: 'Светлая',
        // });
        
        // createElement({
        //     tag: 'button',
        //     parent: this.menuItems,
        //     classes: ['theme-switcher'],
        //     attrs: { id: 'theme-dark' },
        //     text: 'Тёмная',
        // });
        
        // createElement({
        //     tag: 'button',
        //     parent: this.menuItems,
        //     classes: ['theme-switcher'],
        //     attrs: { id: 'theme-auto' },
        //     text: 'Авто',
        // });
        
        document.getElementById('theme-light')?.addEventListener('click', () => {
            ThemeManager.setTheme('light');
        });
        
        document.getElementById('theme-dark')?.addEventListener('click', () => {
            ThemeManager.setTheme('dark');
        });
        
        document.getElementById('theme-auto')?.addEventListener('click', () => {
            ThemeManager.resetToAuto();
        });
    }
}
