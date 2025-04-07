import createElement from '../../utils/createElement.js';

const SIZE_PREFIX = 'avatar_';
const DEFAULT_SIZE_CLASS = SIZE_PREFIX + 'm';
const DEFAULT_SRC = 'static/img/default-avatar.jpg';

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
        this.wrapper = createElement({
            parent: this.#parent,
            classes: [
                'avatar',
                SIZE_PREFIX + this.#config.size || DEFAULT_SIZE_CLASS
            ]
        });
        if (this.#config.class) {
            this.wrapper.classList.add(this.#config.class);
        }

        this.avatar = createElement({
            parent: this.wrapper,
            attrs: {
                src: this.#config.src || DEFAULT_SRC,
                alt: 'Аватар',
                title: 'Аватар',
            },
            classes: ['avatar__image']
        });

        if (this.#config.type === 'status') {
            this.renderStatus();
        } else if (this.#config.type === 'edit') {
            this.renderEdit();
        }
    }

    renderEdit() {
        this.wrapper.classList.add('avatar_edit');

        const shadow = createElement({
            parent: this.wrapper,
            classes: ['avatar__overlay']
        });

        createElement({
            parent: shadow,
            attrs: {
                src: '/static/img/camera-icon.svg',
                alt: 'Редактировать',
                title: 'Редактировать',
            },
            classes: ['avatar__edit-icon']
        });
    }

    renderStatus() {
        const status = 'online'; // TODO: получать данные запросом
        if (status === 'online') {
            createElement({
                parent: this.wrapper,
                classes: ['avatar__status_online']
            });
        } else {
            createElement({
                parent: this.wrapper,
                classes: ['avatar__status_offline'],
                text: this.#config.status
            });
        }
    }
}
