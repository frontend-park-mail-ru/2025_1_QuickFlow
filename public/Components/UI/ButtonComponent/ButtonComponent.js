export default class ButtonComponent {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        this.buttonElement = null;
    }

    render() {
        const button = document.createElement('button');
        button.type = this.config.type || 'button';
        button.textContent = this.config.text || 'Click me';
        button.classList.add('button', this.config.variant === 'secondary' ? 'button-secondary' : 'button-primary');

        if (this.config.disabled) {
            button.disabled = true;
            button.classList.add('button-disabled');
        }

        // Если задан обработчик клика
        if (this.config.onClick && typeof this.config.onClick === 'function') {
            button.addEventListener('click', this.config.onClick);
        }

        this.buttonElement = button;
        this.container.appendChild(button);
    }
}
