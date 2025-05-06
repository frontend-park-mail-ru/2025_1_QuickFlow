import createElement from '@utils/createElement';
import getTimeDifference from '@utils/getTimeDifference';


const SIZE_PREFIX = 'avatar_';
const DEFAULT_SIZE_CLASS = SIZE_PREFIX + 'm';
const DEFAULT_SRC = '/static/img/default-avatar.jpg';


export default class AvatarComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    wrapper: HTMLElement | null = null;
    avatar: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {
        this.wrapper = createElement({
            tag: this.config.href ? 'a' : 'div',
            parent: this.parent,
            classes: [
                'avatar',
                SIZE_PREFIX + this.config.size || DEFAULT_SIZE_CLASS
            ],
            attrs: { href: this.config.href || '' },
        });
        
        if (this.wrapper && this.config.class) {
            this.wrapper.classList.add(this.config.class);
        }

        this.avatar = createElement({
            parent: this.wrapper,
            attrs: {
                src: this.config.src || DEFAULT_SRC,
                alt: 'Аватар',
                title: 'Аватар',
                loading: "lazy",
            },
            classes: ['avatar__image']
        });

        if (this.config.type === 'status') {
            this.renderStatus();
        } else if (this.config.type === 'edit') {
            this.renderEdit();
        }
    }

    renderEdit() {
        if (this.wrapper) {
            this.wrapper.classList.add('avatar_edit');
        }

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
        if (this.config.status.online) {
            createElement({
                parent: this.wrapper,
                classes: ['avatar__status_online'],
            });
        } else {
            createElement({
                parent: this.wrapper,
                classes: ['avatar__status_offline'],
                text: getTimeDifference(
                    this.config.status.lastSeen,
                    { mode: 'short' }
                ),
            });
        }
    }
}
