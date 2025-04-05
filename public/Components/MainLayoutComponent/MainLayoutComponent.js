import createElement from '../../utils/createElement.js';

export default class MainLayoutComponent {
    #parent
    #config
    constructor(config) {
        this.#parent = document.querySelector('main');
        this.#config = config;

        this.container = null;
        this.top = null;
        this.left = null;
        this.right = null;

        this.render();
    }

    render() {
        this.container = createElement({
            parent: this.#parent,
            classes: ['container', `container_${this.#config.type}`],
        });

        switch (this.#config.type) {
            case 'feed':
                this.renderFeed();
                break;
            case 'profile': 
                this.renderProfile();
                break;
            case 'messenger': 
                this.renderMessenger();
                break;
        }
    }

    clear() {
        this.container.innerHTML = '';
        this.#parent.removeChild(this.container);
    }

    renderMessenger() {
        this.#parent.style.position = 'fixed';
    }

    renderProfile() {
        this.#parent.style.position = 'absolute';

        this.top = createElement({
            parent: this.container,
            classes: ['container__row'],
        });

        const bottomRow = createElement({
            parent: this.container,
            classes: ['container__row'],
        });

        this.left = createElement({
            parent: bottomRow,
            classes: ['container__column', 'container__column_left'],
        });

        this.right = createElement({
            parent: bottomRow,
            classes: ['container__column', 'container__column_right'],
        });
    }

    renderFeed() {
        this.#parent.style.position = 'absolute';
        
        this.left = createElement({
            parent: this.container,
            classes: ['container__column', 'container__column_left'],
        });

        this.right = createElement({
            parent: this.container,
            classes: ['container__column', 'container__column_right'],
        });
    }
}
