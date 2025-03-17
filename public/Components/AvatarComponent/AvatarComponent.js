export default class AvatarComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;
        this.wrapper = null;
        this.render();
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('avatar-wrapper', this.#config.size || 'm');
        if (this.#config.class) {
            this.wrapper.classList.add(this.#config.class);
        }
        this.#parent.appendChild(this.wrapper);

        const avatar = document.createElement('img');
        this.wrapper.appendChild(avatar);
        avatar.src = '/static/img/avatar.jpg';
        avatar.classList.add('avatar');

        if (this.#config.status) {
            this.renderStatus();
        }
    }

    renderStatus() {
        if (this.#config.status === 'online') {
            const onlineIcon = document.createElement('div');
            onlineIcon.classList.add('avatar-status-online');
            this.wrapper.appendChild(onlineIcon);
        } else {
            const offlineIcon = document.createElement('div');
            offlineIcon.textContent = this.#config.status;
            offlineIcon.classList.add('avatar-status-offline');
            this.wrapper.appendChild(offlineIcon);
        }
    }
}