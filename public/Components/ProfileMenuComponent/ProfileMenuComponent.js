

export default class ProfileMenuComponent {
    constructor(container, config) {
        this.config = config;
        this.container = container;
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('profile-menu-wrapper');
        this.container.appendChild(this.wrapper);
        this.render();
    }

    render() {
        const avatar = document.createElement('img');
        avatar.classList.add('profile-menu-avatar');
        avatar.src = '/static/img/avatar.jpg';

        const topWrapper = document.createElement('div');
        topWrapper.classList.add('profile-menu-top-wrapper');
        topWrapper.appendChild(avatar);

        const userInfo = document.createElement('div');
        userInfo.classList.add('profile-menu-user-info');
        topWrapper.appendChild(userInfo);

        const name = document.createElement('div');
        name.classList.add('profile-menu-name');
        name.textContent = this.config.data.name;
        userInfo.appendChild(name);

        const username = document.createElement('div');
        username.classList.add('profile-menu-username');
        username.textContent = `@${this.config.data.username}`;
        userInfo.appendChild(username);

        this.wrapper.appendChild(topWrapper);




        const menuItems = document.createElement('div');
        menuItems.classList.add('profile-menu-items');
        this.wrapper.appendChild(menuItems);

        Object.entries(this.config.data.menuItems).forEach(([, { href, text, icon }],) => {
            const menuItem = document.createElement('a');
            menuItem.href = href;
            menuItem.classList.add('profile-menu-item');
            menuItems.appendChild(menuItem);

            const menuItemIcon = document.createElement('img');
            menuItemIcon.classList.add('profile-menu-icon');
            menuItemIcon.src = `/static/img/${icon}.svg`;
            menuItem.appendChild(menuItemIcon);

            const menuItemText = document.createElement('div');
            menuItemText.classList.add('profile-menu-item-text');
            menuItemText.textContent = text;
            menuItem.appendChild(menuItemText);
        });
    }
}
