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
            classes: ['container', this.#config.type],
        });

        if (this.#config.type === 'feed') {
            this.renderFeed();
        } else if (this.#config.type === 'profile') {
            this.renderProfile();
        }

        this.setParentPosition();
    }

    clear() {
        this.container.innerHTML = '';
        document.querySelector('main').removeChild(this.container);
    }

    renderProfile() {
        this.top = createElement({
            parent: this.container,
            classes: ['container-row'],
        });

        const bottom = createElement({
            parent: this.container,
            classes: ['container-row'],
        });

        this.left = createElement({
            parent: bottom,
            classes: ['container-left'],
        });

        this.right = createElement({
            parent: bottom,
            classes: ['container-right'],
        });
    }

    renderFeed() {
        this.left = createElement({
            parent: this.container,
            classes: ['container-left'],
        });

        this.right = createElement({
            parent: this.container,
            classes: ['container-right'],
        });
    }

    setParentPosition() {
        if (this.#config.type === 'messenger') {
            this.container.parentNode.style.position = 'fixed';
            return;
        }
        this.container.parentNode.style.position = 'absolute';
    }
}
