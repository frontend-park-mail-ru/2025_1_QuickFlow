import createElement from '../../../utils/createElement.js';


const DEFAULT_TYPE = 'button';
const DEFAULT_TEXT_CONTENT = '';
const DEFAULT_SIZE_CLASS = 'large';
const DEFAULT_CLASSES = ['button'];


export default class ButtonComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.buttonElement = null;
        this.render();
    }

    render() {
        this.buttonElement = createElement({
            tag: 'button',
            parent: this.#parent,
            attrs: { type: this.#config.type || DEFAULT_TYPE },
            classes: [
                'button',
                `button_${this.#config.variant}`,
                `button_${this.#config.size || DEFAULT_SIZE_CLASS}`,
                ...this.#config.classes || DEFAULT_CLASSES,
            ],
            text: this.#config.text || DEFAULT_TEXT_CONTENT,
        });
        

        if (this.#config.disabled) {
            this.buttonElement.disabled = true;
        }

        if (this.#config.onClick && typeof this.#config.onClick === 'function') {
            this.buttonElement.addEventListener('click', this.#config.onClick);
        }

        if (this.#config.stateUpdaters) {
            if (Array.isArray(this.#config.stateUpdaters) && this.#config.stateUpdaters.length > 0) {
                this.#config.stateUpdaters.forEach(stateUpdater => {
                    stateUpdater.addListener(() => this.updateBtnState());
                });
            }
            this.updateBtnState()
        }
    }

    updateBtnState() {
        const isRequiredValid = this.#config.stateUpdaters.every(stateUpdater => {
            if (stateUpdater.required) return stateUpdater.isValid();
            return true;
        });
        const isOptionalFilled = this.#config.stateUpdaters.some(stateUpdater => {
            if (!stateUpdater.required) return !stateUpdater.isEmpty();
            return true;
        });
        this.buttonElement.disabled = !(isRequiredValid && isOptionalFilled);
    }
}
