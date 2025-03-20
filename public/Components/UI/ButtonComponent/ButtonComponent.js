const DEFAULT_TYPE = 'button';
const DEFAULT_TEXT_CONTENT = '';
const DEFAULT_SIZE_CLASS = 'large';

export default class ButtonComponent {
    #config
    constructor(container, config) {
        this.container = container;
        this.buttonElement = document.createElement('button');
        this.container.appendChild(this.buttonElement);
        this.#config = config;
        this.render();
    }

    render() {
        this.buttonElement.type = this.#config.type || DEFAULT_TYPE;
        this.buttonElement.textContent = this.#config.text || DEFAULT_TEXT_CONTENT;
        this.buttonElement.classList.add(
            'button',
            this.#config.variant === 'secondary' ? 'button-secondary' : 'button-primary',
            this.#config.size || DEFAULT_SIZE_CLASS
        );

        if (this.#config.disabled) {
            this.buttonElement.disabled = true;
            this.buttonElement.classList.add('button-disabled');
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
