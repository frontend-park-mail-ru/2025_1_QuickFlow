export default class AvatarComponent {
    #container;
    #element;

    constructor(container) {
        this.#container = container;
        this.#element = null;
    }

    render() {
        const template = Handlebars.templates['AvatarComponent.hbs'];
        const html = template({});

        this.#container.insertAdjacentHTML('beforeend', html);
        this.#element = this.#container.lastElementChild;
    }
}
