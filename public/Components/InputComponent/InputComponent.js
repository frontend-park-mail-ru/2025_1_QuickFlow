export default class InputComponent {
    #container;
    #config;
    inputElement;
    inputError;
    inputCounter;
    wrapper;

    constructor(container, config) {
        this.#container = container;
        this.#config = config;
        this.inputElement = null;
        this.inputError = null;
        this.inputCounter = null;
        this.wrapper = null;
    }

    render() {
        const template = Handlebars.templates['InputComponent.hbs'];
        const inputHTML = template({
            label: this.#config.label,
            name: this.#config.name,
            type: this.#config.type || 'text',
            placeholder: this.#config.placeholder || '',
            autocomplete: this.#config.autocomplete || 'off',
            maxLength: this.#config.maxLength || 256,
            required: this.#config.required,
            showRequired: this.#config.showRequired,
            description: this.#config.description,
            isPassword: this.#config.type === 'password'
        });

        this.#container.insertAdjacentHTML('beforeend', inputHTML);
        this.wrapper = this.#container.lastElementChild;
        this.inputElement = this.wrapper.querySelector('.input-field');
        this.inputError = this.wrapper.querySelector('.input-error');
        this.inputCounter = this.wrapper.querySelector('.input-counter');

        if (this.#config.type === 'password') {
            this.#setupPasswordToggle();
        }

        if (this.#config.validation) {
            this.inputElement.addEventListener('input', () => this.validate());
        }

        if (this.inputCounter) {
            this.inputElement.addEventListener('input', () => {
                this.inputCounter.textContent =
                    this.#config.maxLength - this.inputElement.value.length;
            });
        }
    }

    #setupPasswordToggle() {
        const pwdControl = this.wrapper.querySelector('.pwd-control');
        pwdControl.addEventListener('click', () => {
            if (this.inputElement.type === 'password') {
                pwdControl.classList.add('show');
                this.inputElement.type = 'text';
            } else {
                pwdControl.classList.remove('show');
                this.inputElement.type = 'password';
            }
        });
    }

    validate() {
        const value = this.inputElement.value.trim();

        switch (this.#config.validation) {
            case 'email':
                this.#validateEmail(value);
                break;
            case 'password':
                this.inputElement.minLength = 8;
                this.#validatePassword(value);
                break;
            case 'username':
                this.#validateUsername(value);
                break;
            case 'date':
                this.inputElement.maxLength = 10;
                this.inputElement.addEventListener('input', this.#formatDateInput);
                if (value.length === 10) {
                    this.#validateDate(value);
                } else {
                    this.hideError();
                }
                break;
            default:
                break;
        }
    }

    #validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9._]+$/;
        if (!usernameRegex.test(username)) {
            this.showError(
                'Имя пользователя может содержать только латинские буквы, цифры, "." и "_"'
            );
        } else {
            this.hideError();
        }
    }

    #validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email) && email) {
            this.showError('Некорректный Email');
        } else {
            this.hideError();
        }
    }

    #validatePassword(password) {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasCyrillic = /[\u0400-\u04FF]/.test(password);
        const hasNumeric = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasSpaces = /\s/.test(password);

        if (!password) {
            this.showError('Введите пароль');
        } else if (password.length < 8) {
            this.showError('Пароль должен содержать минимум 8 символов');
        } else if (hasCyrillic) {
            this.showError('Пароль не должен содержать символов кириллицы');
        } else if (hasSpaces) {
            this.showError('Пароль не должен содержать пробелы');
        } else if (!hasLowercase || !hasUppercase) {
            this.showError('Пароль должен содержать символы в верхнем и нижнем регистрах');
        } else if (!hasNumeric) {
            this.showError('Пароль должен содержать хотя бы одну цифру');
        } else if (!hasSpecial) {
            this.showError('Пароль должен содержать хотя бы один спецсимвол');
        } else {
            this.hideError();
        }
    }

    #formatDateInput(event) {
        let value = event.target.value.replace(/\D/g, ''); // Удаляем все нецифровые символы
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 2 && value[2] !== '.') value = value.slice(0, 2) + '.' + value.slice(2);
        if (value.length > 5 && value[5] !== '.') value = value.slice(0, 5) + '.' + value.slice(5);
        event.target.value = value;
    }

    #validateDate(date) {
        const datePattern = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(\d{4})$/;
        if (!datePattern.test(date)) {
            this.showError('Некорректный формат даты');
            return;
        }

        const [day, month, year] = date.split('.').map(Number);
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();

        if (inputDate > today) {
            this.showError('Дата не должна быть в будущем');
            return;
        }

        if (
            inputDate.getDate() !== day ||
            inputDate.getMonth() + 1 !== month ||
            inputDate.getFullYear() !== year
        ) {
            this.showError('Некорректная дата');
            return;
        }

        this.hideError();
    }

    showError(message) {
        this.inputError.textContent = message;
        this.inputError.style.display = 'block';
        this.inputElement.classList.add('invalid');
    }

    hideError() {
        this.inputError.style.display = 'none';
        this.inputElement.classList.remove('invalid');
    }
}
