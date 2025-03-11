console.log('InputComponent.js загружен!');

export default class InputComponent {
    constructor(container, config) {
        this.config = config;
        this.defaultMaxLength = 256;
        this.container = container;
        this.input = null;
        this.error = null;
        this.wrapper = null;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('input-wrapper');

        // Label (если задан)
        if (this.config.label) {
            const label = document.createElement('label');
            label.textContent = this.config.label;
            label.classList.add('input-label');
            if (this.config.showRequired) {
                const requiredMark = document.createElement('span');
                requiredMark.textContent = ' *';
                requiredMark.classList.add('required');
                label.appendChild(requiredMark);
            }
            this.wrapper.appendChild(label);
        }

        // Поле ввода
        this.input = document.createElement('input');
        this.input.classList.add('input-field');
        this.input.type = this.config.type || 'text';
        this.input.autocomplete = this.config.autocomplete || 'off';
        this.input.placeholder = this.config.placeholder || '';
        this.input.maxLength = this.config.maxLength || this.defaultMaxLength;
        this.input.required = this.config.required || false;

        const innnerWrapper = document.createElement('div');
        innnerWrapper.classList.add('inner-wrapper');
        this.wrapper.appendChild(innnerWrapper);
        innnerWrapper.appendChild(this.input);

        this.error = document.createElement('div');
        this.error.classList.add('input-error');

        if (this.input.type === 'password') {
            const pwdControl = document.createElement('a');
            pwdControl.classList.add('pwd-control');

            pwdControl.addEventListener('click', () => {
                if (this.input.getAttribute('type') === 'password') {
                    pwdControl.classList.add('show');
                    this.input.setAttribute('type', 'text');
                } else {
                    pwdControl.classList.remove('show');
                    this.input.setAttribute('type', 'password');
                }
            });

            innnerWrapper.appendChild(pwdControl);
        }

        // Добавление обработчиков валидации
        if (this.config.validation) {
            this.input.addEventListener('input', () => this.validate());
        }

        // Описание (если задано)
        if (this.config.description || this.config.maxLength) {
            const descWrapper = document.createElement('div');
            descWrapper.classList.add('description-wrapper');

            if (this.config.description) {
                const description = document.createElement('span');
                description.textContent = this.config.description;
                description.classList.add('input-description');
                descWrapper.appendChild(description);
            }

            if (this.config.maxLength) {
                const counter = document.createElement('span');
                counter.textContent = this.config.maxLength;
                counter.classList.add('input-counter');

                this.input.addEventListener('input', () => {
                    counter.textContent = this.config.maxLength - this.input.value.length;
                });

                descWrapper.appendChild(counter);
            }

            this.wrapper.appendChild(descWrapper);
        }

        this.container.appendChild(this.wrapper);
    }

    validate() {
        const value = this.input.value.trim();

        if (this.config.validation === 'email') {
            this.validateEmail(value);
        } else if (this.config.validation === 'password') {
            this.input.minLength = 8;
            this.validatePassword(value);
        } else if (this.config.validation === 'username') {
            this.validateUsername(value);
        } else if (this.config.validation === 'date') {
            this.input.maxLength = 10;
            this.input.addEventListener('input', this.formatDateInput);
            if (value.length === 10) {
                this.validateDate(value);
            } else {
                this.hideError();
            }
        }
    }

    validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9._]+$/;
        if (!usernameRegex.test(username)) {
            this.showError(
                'Имя пользователя может содержать только латинские буквы, цифры, "." и "_"'
            );
            return false;
        } else {
            this.hideError();
            return true;
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
        const chars = Array.from(password);
        const hasValidCharacters = chars.every((char) => /[A-Za-z0-9_/!@#$%^&*(),.?":{}|<>]/.test(char));
        const hasUppercase = chars.some((char) => /[A-Z]/.test(char));
        const hasLowercase = chars.some((char) => /[a-z]/.test(char));
        // const hasCyrillic = chars.some((char) => /^[\u0400-\u04FF]+$/.test(char));
        const hasNumeric = chars.some((char) => !isNaN(char) && char !== ' ');
        // const hasSpaces = chars.some((char) => char === ' ');
        const hasSpecial = chars.some((char) => /[_/!@#$%^&*(),.?":{}|<>]/.test(char));

        if (!password) {
            this.showError('Введите пароль');
        } else if (!hasValidCharacters) {
            this.showError('Пароль содержит некорректные символы');
        } else if (password.length < 8) {
            this.showError('Пароль должен содержать минимум 8 символов');
        // } else if (hasCyrillic) {
        //     this.showError('Пароль не должен содержать символов кириллицы');
        // } else if (hasSpaces) {
        //     this.showError('Пароль не должен содержать пробелы');
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

    formatDateInput(event) {
        let value = event.target.value.replace(/\D/g, ''); // Удаляем все нецифровые символы

        if (value.length > 8) {
            value = value.slice(0, 8); // Ограничиваем ввод 8 символами
        }

        // Добавляем точки в нужные места, если их нет
        if (value.length > 2 && value[2] !== '.') {
            value = value.slice(0, 2) + '.' + value.slice(2);
        }
        if (value.length > 5 && value[5] !== '.') {
            value = value.slice(0, 5) + '.' + value.slice(5);
        }

        event.target.value = value;
    }

    validateDate(date) {
        const datePattern = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(\d{4})$/;

        if (!datePattern.test(date)) {
            this.showError('Некорректный формат даты');
            return;
        }

        const [day, month, year] = date.split('.').map(Number);
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();

        // Проверка на будущее время
        if (inputDate > today) {
            this.showError('Дата не должна быть в будущем');
            return;
        }

        // Проверка корректности даты
        if (
            inputDate.getDate() !== day ||
            inputDate.getMonth() + 1 !== month ||
            inputDate.getFullYear() !== year
        ) {
            this.showError('Некорректная дата');
            return;
        }

        this.hideError(); // Если все ок, скрываем ошибку
    }

    showError(message) {
        this.wrapper.appendChild(this.error);
        this.error.textContent = message;
        this.error.style.display = 'block';
        this.input.classList.add('invalid');
    }

    hideError() {
        if (this.input.classList.contains('invalid')) {
            this.wrapper.removeChild(this.error);
            this.input.classList.remove('invalid');
        }
    }
}
