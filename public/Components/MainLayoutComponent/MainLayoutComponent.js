import createElement from '../../utils/createElement.js';


export default class MainLayoutComponent {
    #main
    #config
    #parent
    constructor() {
        if (MainLayoutComponent.__instance) {
            return MainLayoutComponent.__instance;
        }
        this.#config = {};

        this.#parent = document.getElementById('parent');
        this.#main = document.querySelector('main');
        this.container = null;

        this.top = null;
        this.left = null;
        this.right = null;

        MainLayoutComponent.__instance = this;
    }

    render(config) {
        this.#config = config;
        this.#main.innerHTML = '';
        this.resetClasses();

        this.container = createElement({
            parent: this.#main,
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
            case 'auth': 
                this.renderAuth();
                break;
            case 'not-found': 
                this.renderNotFound();
                break;
        }

        return this;
    }

    resetClasses() {
        this.#parent.classList = 'parent container';
        this.#main.classList = 'main';
        if (this.container) this.container.classList = 'container';
    }

    clear() {
        this.container.innerHTML = '';
        this.#main.removeChild(this.container);
    }

    renderNotFound() {
        this.#parent.classList.add('parent_hidden-ui');
        this.#main.classList.add('main_wide');
    }

    renderAuth() {
        this.#parent.classList.add('parent_hidden-ui');
        this.#main.classList.add('main_wide');
    }

    renderMessenger() {
        this.#main.style.position = 'fixed';
    }

    renderProfile() {
        this.#main.style.position = 'absolute';

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
        this.#main.style.position = 'absolute';
        
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
