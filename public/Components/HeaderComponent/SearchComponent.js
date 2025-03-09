export default class SearchComponent {
    #container;
    #config;
    element; //может быть лучше с #

    constructor(container, config = {}) {
        this.#container = container;
        this.#config = config;
        this.element = null;
    }

    render() {
        const template = Handlebars.templates['SearchComponent.hbs'];
        const html = template({
            placeholder: this.#config.placeholder || 'Поиск'
        });

        this.#container.insertAdjacentHTML('beforeend', html);
        this.element = this.#container.lastElementChild;
    }
}
