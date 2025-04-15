import createElement from "../../../utils/createElement.js";


const DEFAULT_PLACEHOLDER = '';
const DEFAULT_TEXT = '';
const DEFAULT_NAME = '';
const DEFAULT_MAX_LENGTH = 256;


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
                maxlength: this.#config.maxLength || DEFAULT_MAX_LENGTH,
            },
            text: this.#config.value || DEFAULT_TEXT,
        });

        for (const attr in this.#config.attrs) {
            this.textarea.setAttribute(attr, this.#config.attrs[attr]);
        }

        if (this.#config.description || this.#config.maxLength) {
            const descWrapper = createElement({
                parent: this.wrapper,
                classes: ['textarea__description-wrapper'],
            });

            if (this.#config.description) {
                createElement({
                    tag: 'span',
                    text: this.#config.description,
                    parent: descWrapper,
                    classes: ['input__description'],
                });
            }

            if (this.#config.showCharactersLeft) {
                const counter = createElement({
                    tag: 'span',
                    text: this.#config.maxLength - this.textarea.value.length,
                    parent: descWrapper,
                    classes: ['input__counter'],
                });

                this.textarea.addEventListener('input', () => {
                    counter.textContent = this.#config.maxLength - this.textarea.value.length;
                });
            }
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
