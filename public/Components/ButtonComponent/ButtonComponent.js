export default class ButtonComponent {
    #container;
    #config;

    constructor(container, config) {
        this.#container = container;
        this.#config = config;
        this.buttonElement = null; // Добавляем сохранение кнопки
    }

    render() {
        const template = Handlebars.templates['ButtonComponent.hbs'];
        const buttonHTML = template({
            text: this.#config.text || 'Click me',
            isSecondary: this.#config.variant === 'secondary',
            disabled: this.#config.disabled
        });

        this.#container.insertAdjacentHTML('beforeend', buttonHTML);

        this.buttonElement = this.#container.lastElementChild; // Сохраняем кнопку в this.buttonElement
        if (this.#config.onClick && typeof this.#config.onClick === 'function') {
            this.buttonElement.addEventListener('click', this.#config.onClick);
        }
    }
}
