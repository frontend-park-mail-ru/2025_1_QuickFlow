import SearchComponent from './SearchComponent.js';
import AvatarComponent from './AvatarComponent.js';

export default class HeaderComponent {
    #container;
    #menu;
    #element;

    constructor(container, menu) {
        this.#container = container;
        this.#menu = menu;
        this.#element = null;
    }

    render() {
        const template = Handlebars.templates['HeaderComponent.hbs'];
        const html = template({});

        this.#container.insertAdjacentHTML('beforeend', html);
        this.#element = this.#container.lastElementChild;

        // Рендерим вложенные компоненты
        new SearchComponent(this.#element).render();
        new AvatarComponent(this.#element).render();
    }
}
