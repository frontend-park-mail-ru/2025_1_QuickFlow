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
        this.wrapper = createElement({
            parent: this.#parent,
            classes: ['avatar-wrapper', this.#config.size || DEFAULT_SIZE_CLASS]
        });
        if (this.#config.class) {
            this.wrapper.classList.add(this.#config.class);
        }

        this.avatar = createElement({
            parent: this.wrapper,
            attrs: {
                src: this.#config.src,
                alt: 'Аватар',
                title: 'Аватар',
            },
            classes: ['avatar']
        });

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
            createElement({
                parent: this.wrapper,
                classes: ['avatar-status-online']
            });
        } else {
            createElement({
                parent: this.wrapper,
                classes: ['avatar-status-offline'],
                text: this.#config.status
            });
        }
    }
}
