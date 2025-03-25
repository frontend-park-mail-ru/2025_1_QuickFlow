import createElement from '../../../utils/createElement.js';


const DEFAULT_REQUIRED = false;
const REQUIRED_MARK_TEXT = ' *';


export default class RadioComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.wrapper = null;
        this.render();
    }

    render() {
        this.wrapper = createElement({
            parent: this.#parent,
            classes: ['radio-wrapper'],
        });

        if (this.#config.label) {
            const label = createElement({
                tag: 'label',
                text: this.#config.label,
                parent: this.wrapper,
                classes: ['input-label'],
            });

            if (this.#config.showRequired === true) {
                createElement({
                    tag: 'span',
                    text: REQUIRED_MARK_TEXT,
                    parent: label,
                    classes: ['required'],
                });
            }
        }

        const choicesWrapper = createElement({
            parent: this.wrapper,
            classes: ['choices-wrapper'],
        });

        for (const key in this.#config.radios) {
            const radioData = this.#config.radios[key];

            const choice = createElement({
                parent: choicesWrapper,
                classes: ['choice'],
            });

            createElement({
                tag: 'input',
                parent: choice,
                attrs: {
                    type: 'radio',
                    name: this.#config.name,
                    value: radioData.value,
                    id: radioData.id,
                    required: this.#config.required || DEFAULT_REQUIRED,
                },
            });

            createElement({
                tag: 'label',
                text: radioData.label,
                parent: choice,
                attrs: {
                    htmlFor: radioData.id,
                },
            });
        }
    }

    addListener(listener) {
        this.wrapper.addEventListener('change', listener);
    }

    isValid() {
        if (!this) {
            return false;
        }
        return this.wrapper.querySelector('input[type="radio"]:checked') !== null;
    }

    getChecked() {
        return this.wrapper.querySelector('input[type="radio"]:checked');
    }

    setChecked(value) {
        const radio = this.wrapper.querySelector(`input[type="radio"][value="${value}"]`);
        if (radio) {
            radio.checked = true;
        }
    }
}
