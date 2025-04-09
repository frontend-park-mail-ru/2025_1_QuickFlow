import createElement from "../../../utils/createElement.js";


const DEFAULT_PLACEHOLDER = '';
const DEFAULT_TEXT = '';
const DEFAULT_NAME = '';


export default class TextareaComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config || {};

        this.wrapper = null;
        this.textarea = null;
        this.render();
    }

    render() {
        this.wrapper = createElement({
            parent: this.#parent,
            classes: ['textarea'],
        });

        if (this.#config.classes) {
            this.#config.classes.forEach(className => this.wrapper.classList.add(className));
        }

        if (this.#config.label) {
            createElement({
                tag: 'label',
                parent: this.wrapper,
                text: this.#config.label,
                classes: ['textarea__label'],
            });
        }

        this.textarea = createElement({
            tag: 'textarea',
            parent: this.wrapper,
            classes: ['textarea__field'],
            attrs: {
                placeholder: this.#config.placeholder || DEFAULT_PLACEHOLDER,
                name: this.name || DEFAULT_NAME,
            },
            text: this.#config.value || DEFAULT_TEXT,
        });

        for (const attr in this.#config.attrs) {
            this.textarea.setAttribute(attr, this.#config.attrs[attr]);
        }
    }

    addListener(listener) {
        this.textarea.addEventListener('input', listener);
    }

    get value() {
        return this.textarea.value.trim();
    }

    get name() {
        return this.#config.name?.trim();
    }

    isValid() {
        if (!this.required) return true;
        return this.textarea.value.trim() !== '';
    }

    isEmpty() {
        return this.textarea.value.trim() === '';
    }

    get required() {
        return this.#config.required;
    }
}
