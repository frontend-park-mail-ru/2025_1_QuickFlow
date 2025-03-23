import createElement from '../../utils/createElement.js';

const DEFAULT_SIZE_CLASS = 'm';

export default class AvatarComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.wrapper = null;
        this.avatar = null;

        this.render();
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('avatar-wrapper', this.#config.size || DEFAULT_SIZE_CLASS);
        if (this.#config.class) {
            this.wrapper.classList.add(this.#config.class);
        }
        this.#parent.appendChild(this.wrapper);

        this.avatar = document.createElement('img');
        this.wrapper.appendChild(this.avatar);
        this.avatar.src = this.#config.src;
        this.avatar.classList.add('avatar');

        if (this.#config.type === 'status') {
            this.renderStatus();
        } else if (this.#config.type === 'edit') {
            this.renderEdit();
        }
    }

    renderEdit() {
        this.wrapper.classList.add('edit');

        const shadow = createElement({
            parent: this.wrapper,
            classes: ['darken']
        });

        createElement({
            parent: shadow,
            attrs: {
                src: '/static/img/camera-icon.svg',
                alt: 'Редактировать',
                title: 'Редактировать',
            },
            classes: ['avatar-edit-icon']
        });
    }

    renderStatus() {
        const status = 'online'; // TODO: получать данные запросом
        if (status === 'online') {
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
