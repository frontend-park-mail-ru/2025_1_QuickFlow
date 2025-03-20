const DEFAULT_PLACEHOLDER = '';

export default class TextareaComponent {
    #config
    constructor(container, config) {
        this.container = container;
        this.textarea = null;
        this.#config = config || {};
        this.render();
    }

    render() {
        this.textarea = document.createElement('textarea');
        if (this.#config.class) {
            this.textarea.classList.add(this.#config.class);
        }
        this.textarea.placeholder = this.#config.placeholder || DEFAULT_PLACEHOLDER;
        this.container.appendChild(this.textarea);
    }

    addListener(listener) {
        this.textarea.addEventListener('input', listener);
    }

    isValid() {
        return this.textarea.value.trim() !== '';
    }
}
