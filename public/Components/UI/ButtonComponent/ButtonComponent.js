import createElement from '../../../utils/createElement.js';


const DEFAULT_TYPE = 'button';
const DEFAULT_TEXT_CONTENT = '';
const DEFAULT_SIZE_CLASS = 'large';


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
            attrs: {
                type: this.#config.type || DEFAULT_TYPE,

            },
            classes: [
                'button',
                `button-${this.#config.variant}`,
                this.#config.size || DEFAULT_SIZE_CLASS,
                this.#config.classes ? [...this.#config.classes] : null, // TODO: протестировать
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
        const isAllValid = this.#config.stateUpdaters.every(stateUpdater => stateUpdater.isValid());
        this.buttonElement.disabled = !isAllValid;
    }
}
