import createElement from '../../../utils/createElement.js';


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
            classes: ['radio'],
        });

        if (this.#config.label) {
            const label = createElement({
                tag: 'label',
                text: this.#config.label,
                parent: this.wrapper,
                classes: ['input__label'],
            });

            if (this.#config.showRequired === true) {
                createElement({
                    tag: 'span',
                    text: REQUIRED_MARK_TEXT,
                    parent: label,
                    classes: ['input__required'],
                });
            }
        }

        const choicesWrapper = createElement({
            parent: this.wrapper,
            classes: ['radio__choices'],
        });

        for (const key in this.#config.radios) {
            const radioData = this.#config.radios[key];

            const choice = createElement({
                parent: choicesWrapper,
                classes: ['radio__choice'],
            });

            const input = createElement({
                tag: 'input',
                parent: choice,
                attrs: {
                    type: 'radio',
                    name: this.#config.name,
                    value: radioData.value,
                    id: radioData.id,
                },
                classes: ['radio__input'],
            });

            choice.addEventListener('click', () => input.checked = true);

            if (this.#config.required) {
                input.setAttribute('required', '');
            }

            createElement({
                tag: 'label',
                text: radioData.label,
                parent: choice,
                attrs: {
                    for: radioData.id,
                },
            });
        }
    }

    addListener(listener) {
        this.wrapper.addEventListener('change', listener);
    }

    isValid() {
        if (!this) return false;
        return this.getChecked() !== null;
    }

    get required() {
        return this.#config.required;
    }

    get value() {
        return this.getChecked().value.trim();
    }

    get name() {
        return this.#config.name?.trim();
    }

    getChecked() {
        return this.wrapper.querySelector('.radio__input:checked');
    }

    setChecked(value) {
        const radio = this.wrapper.querySelector(`.radio__input[value="${value}"]`);
        if (radio) radio.checked = true;
    }
}
