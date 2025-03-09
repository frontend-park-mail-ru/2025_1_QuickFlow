console.log("RadioComponent.js загружен!");


export default class RadioComponent {
    constructor(container, config) {
        this.config = config;
        this.container = container;
        this.wrapper = null;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('radio-wrapper');

        // Label (если задан)
        if (this.config.label) {
            const label = document.createElement('label');
            label.textContent = this.config.label;
            label.classList.add('input-label');
            if (this.config.showRequired === true) {
                const requiredMark = document.createElement('span');
                requiredMark.textContent = ' *';
                requiredMark.classList.add('required');
                label.appendChild(requiredMark);
            }
            this.wrapper.appendChild(label);
        }

        const choicesWrapper = document.createElement('div');
        choicesWrapper.classList.add('choices-wrapper');
        this.wrapper.appendChild(choicesWrapper);

        for (const key in this.config.radios) {
            const radioData = this.config.radios[key];
            const choice = document.createElement('div');
            choice.classList.add('choice');

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = this.config.name;
            radio.id = radioData.id;
            radio.required = this.config.required || false;

            const label = document.createElement('label');
            label.textContent = radioData.label;
            label.htmlFor = radioData.id;

            choice.appendChild(radio);
            choice.appendChild(label);
            choicesWrapper.appendChild(choice);
        }

        // // Поле ввода
        // const input = document.createElement('input');
        // input.classList.add('input-field');
        // input.type = this.config.type || 'text';
        // input.autocomplete = this.config.autocomplete || 'off';
        // input.placeholder = this.config.placeholder || '';
        // input.maxLength = this.config.maxLength || this.defaultMaxLength;
        // input.required = this.config.required || false;

        // this.inputElement = input;
        // this.wrapper.appendChild(input);

        // this.inputError = document.createElement('div');
        // this.inputError.classList.add('input-error');

        // // Добавление обработчиков валидации
        // if (this.config.validation === true) {
        //     input.addEventListener('input', () => this.validate());
        // }

        this.container.appendChild(this.wrapper);
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
