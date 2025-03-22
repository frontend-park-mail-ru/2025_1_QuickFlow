import createElement from "../../../utils/createElement.js";


const DEFAULT_PLACEHOLDER = '';


export default class TextareaComponent {
    #config
    constructor(container, config) {
        this.container = container;
        this.#config = config || {};

        this.wrapper = null;
        this.textarea = null;
        this.render();
    }

    render() {
        this.wrapper = createElement({
            classes: ['textarea-wrapper'],
        });

        if (this.#config.classes) {
            this.#config.classes.forEach(className => this.wrapper.classList.add(className));
        }

        if (this.#config.label) {
            const label = document.createElement('label');
            label.textContent = this.#config.label;
            label.classList.add('input-label');
            this.wrapper.appendChild(label);
        }

        this.textarea = document.createElement('textarea');
        this.textarea.placeholder = this.#config.placeholder || DEFAULT_PLACEHOLDER;
        
        this.wrapper.appendChild(this.textarea);
        this.container.appendChild(this.wrapper);
    }

    addListener(listener) {
        this.textarea.addEventListener('input', listener);
    }

    isValid() {
        return this.textarea.value.trim() !== '';
    }
}
