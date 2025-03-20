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
        this.container = document.createElement('div');
        this.container.classList.add('container', this.#config.type);
        this.#parent.appendChild(this.container);

        if (this.#config.type === 'feed') {
            this.renderFeed();
        } else if (this.#config.type === 'profile') {
            this.renderProfile();
        }
    }

    renderProfile() {
        this.top = document.createElement('div');
        this.top.classList.add('container-row');
        this.container.appendChild(this.top);

        const bottom = document.createElement('div');
        bottom.classList.add('container-row');
        this.container.appendChild(bottom);

        this.left = document.createElement('div');
        this.left.classList.add('container-left');
        bottom.appendChild(this.left);

        this.right = document.createElement('div');
        this.right.classList.add('container-right');
        bottom.appendChild(this.right);
    }

    renderFeed() {
        this.left = document.createElement('div');
        this.left.classList.add('container-left');
        this.container.appendChild(this.left);

        this.right = document.createElement('div');
        this.right.classList.add('container-right');
        this.container.appendChild(this.right);
    }
}
