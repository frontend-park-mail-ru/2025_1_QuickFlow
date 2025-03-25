import createElement from "../../../utils/createElement.js";


const DEFAULT_PLACEHOLDER = '';


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
            classes: ['textarea-wrapper'],
        });

        if (this.#config.classes) {
            this.#config.classes.forEach(className => this.wrapper.classList.add(className));
        }

        if (this.#config.label) {
            createElement({
                tag: 'label',
                parent: this.wrapper,
                text: this.#config.label,
                classes: ['input-label'],
            });
        }

        this.textarea = createElement({
            tag: 'textarea',
            parent: this.wrapper,
            attrs: {
                placeholder: this.#config.placeholder || DEFAULT_PLACEHOLDER,
            },
        });
    }

    addListener(listener) {
        this.textarea.addEventListener('input', listener);
    }

    isValid() {
        return this.textarea.value.trim() !== '';
    }
}
