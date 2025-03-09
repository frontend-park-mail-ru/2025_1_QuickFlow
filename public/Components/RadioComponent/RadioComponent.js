console.log('RadioComponent.js загружен!');

export default class RadioComponent {
    #container;
    #config;
    wrapper;

    constructor(container, config) {
        this.#container = container;
        this.#config = config;
        this.wrapper = null;
    }

    render() {
        const template = Handlebars.templates['RadioComponent.hbs'];
        const radioHTML = template({
            label: this.#config.label,
            name: this.#config.name,
            radios: this.#config.radios,
            required: this.#config.required,
            showRequired: this.#config.showRequired
        });

        this.#container.insertAdjacentHTML('beforeend', radioHTML);
        this.wrapper = this.#container.lastElementChild;
    }

    validate() {
        const value = this.inputElement.value.trim();

        if (this.config.type === 'email') {
            this.validateEmail(value);
        } else if (this.config.type === 'password') {
            this.validatePassword(value);
        }
    }

    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email) && email) {
            this.showError('Некорректный Email');
        } else {
            this.hideError();
        }
    }

    validatePassword(password) {
        if (!password) {
            this.showError('Введите пароль');
        } else if (password.length < 8) {
            this.showError('Пароль должен содержать минимум 8 символов');
        } else if (/\s/.test(password)) {
            this.showError('Пароль не должен содержать пробелы');
        } else {
            this.hideError();
        }
    }

    showError(message) {
        this.wrapper.appendChild(this.inputError);
        this.inputError.textContent = message;
        this.inputError.style.display = 'block';
        this.inputElement.classList.add('invalid');
    }

    hideError() {
        this.wrapper.removeChild(this.inputError);
        this.inputElement.classList.remove('invalid');
    }
}
