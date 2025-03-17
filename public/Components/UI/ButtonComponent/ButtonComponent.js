export default class ButtonComponent {
    constructor(container, config) {
        this.container = container;
        this.buttonElement = document.createElement('button');
        this.container.appendChild(this.buttonElement);
        this.config = config;
        this.render();
    }

    render() {
        this.buttonElement.type = this.config.type || 'button';
        this.buttonElement.textContent = this.config.text || '';
        this.buttonElement.classList.add(
            'button',
            this.config.variant === 'secondary' ? 'button-secondary' : 'button-primary',
            this.config.size || 'large'
        );

        if (this.config.disabled) {
            this.buttonElement.disabled = true;
            this.buttonElement.classList.add('button-disabled');
        }

        if (this.config.onClick && typeof this.config.onClick === 'function') {
            this.buttonElement.addEventListener('click', this.config.onClick);
        }

        if (this.config.stateUpdaters) {
            if (Array.isArray(this.config.stateUpdaters) && this.config.stateUpdaters.length > 0) {
                this.config.stateUpdaters.forEach(stateUpdater => {
                    stateUpdater.addListener(() => this.updateBtnState());
                });
            }
            this.updateBtnState()
        }
    }

    updateBtnState() {
        const isAllValid = this.config.stateUpdaters.every((stateUpdater) => {
            return stateUpdater.isValid();
        });
        this.buttonElement.disabled = !isAllValid;
    }
}
