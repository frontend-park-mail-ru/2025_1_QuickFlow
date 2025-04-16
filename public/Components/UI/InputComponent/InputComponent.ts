import formatDateInput from '@utils/formatDateInput';
import createElement from '@utils/createElement';


const DEFAULT_MAX_LENGTH = 256;
const DEFAULT_AUTOCOMPLETE = 'off';
const DEFAULT_PLACEHOLDER = '';
const DEFAULT_TYPE = 'text';
const DEFAULT_INPUT_VALUE = '';
const REQUIRED_MARK_TEXT = ' *';
const MAX_DATE_INPUT_LENGTH = 10;
const MIN_NAME_INPUT_LENGTH = 2;
const MIN_PASSWORD_INPUT_LENGTH = 8;
const DEFAULT_NAME = 'undefined';


export default class InputComponent {
    #parent;
    #config;
    
    input: HTMLInputElement | null = null;
    error: HTMLElement | null = null;
    wrapper: HTMLElement | null = null;
    innnerWrapper: HTMLElement | null = null;

    constructor(parent: any, config: any) {
        this.#config = config;
        this.#parent = parent;

        this.render();
    }

    get config() {
        return this.#config;
    }

    get value() {
        if (!this.input) return;
        return this.input.value.trim();
    }

    get name() {
        return this.#config.name?.trim();
    }

    get required() {
        return this.#config.required;
    }

    isEmpty() {
        if (!this.input) return;
        return this.input.value.trim() === '';
    }

    render() {
        this.wrapper = createElement({
            parent: this.#parent,
            classes: [this.#config.classes, 'input'],
        });

        // Label (если задан)
        if (this.#config.label) {
            const label = createElement({
                tag: 'label',
                text: this.#config.label,
                parent: this.wrapper,
                classes: ['input__label'],
            });
            if (this.#config.showRequired) {
                createElement({ // TODO: протестировать
                    tag: 'span',
                    text: REQUIRED_MARK_TEXT,
                    parent: label,
                    classes: ['input__required'],
                });
            }
        }
        
        this.innnerWrapper = createElement({
            parent: this.wrapper,
            classes: ['input__inner'],
        });

        // Поле ввода
        this.input = createElement({
            tag: 'input',
            parent: this.innnerWrapper,
            classes: ['input__field'],
            attrs: {
                type: this.#config.type || DEFAULT_TYPE,
                autocomplete: this.#config.autocomplete || DEFAULT_AUTOCOMPLETE,
                placeholder: this.#config.placeholder || DEFAULT_PLACEHOLDER,
                maxLength: this.#config.maxLength || DEFAULT_MAX_LENGTH,
                value: this.#config.value || DEFAULT_INPUT_VALUE,
                name: this.name || DEFAULT_NAME,
            },
        }) as HTMLInputElement;

        if (this.required) {
            this.input.setAttribute('required', '');
        }

        this.error = createElement({
            classes: ['input__error'],
        });

        if (this.input.type === 'password') {
            const pwdControl = createElement({
                parent: this.innnerWrapper,
                tag: 'a',
                classes: ['input__password-toggle'],
            });

            pwdControl.addEventListener('click', () => {
                if (!this.input) return;

                const isPwdType = this.input.getAttribute('type') === 'password';
                if (isPwdType) {
                    pwdControl.classList.add('input__password-toggle_show');
                } else {
                    pwdControl.classList.remove('input__password-toggle_show');
                }
                this.input.setAttribute('type', isPwdType ? 'text' : 'password');
            });
        } else if (this.input.type === 'search') {
            createElement({
                parent: this.innnerWrapper,
                classes: ['input__search-icon'],
            });
        }

        // Добавление обработчиков валидации
        if (this.#config.validation) {
            this.input.addEventListener('input', () => this.validate());
        }

        // Описание (если задано)
        if (this.#config.description || this.#config.maxLength) { // TODO: протестировать 
            const descWrapper = createElement({
                parent: this.wrapper,
                classes: ['input__description-wrapper'],
            });

            if (this.#config.description) {
                createElement({
                    tag: 'span',
                    text: this.#config.description,
                    parent: descWrapper,
                    classes: ['input__description'],
                });
            }

            if (this.#config.showCharactersLeft) {
                const counter = createElement({
                    tag: 'span',
                    text: this.#config.maxLength,
                    parent: descWrapper,
                    classes: ['input__counter'],
                });

                this.input.addEventListener('input', () => {
                    if (!this.input) return;
                    counter.textContent = (this.#config.maxLength - this.input.value.length).toString();
                });
            }
        }
    }

    addListener(listener: any, delayTime = 0) {
        if (!this.input) return;
        let debounce = function(func: any, delay: number) {
            let inDebounce: ReturnType<typeof setTimeout>;
            return function(this: any, ...args: any[]) {
                clearTimeout(inDebounce);
                inDebounce = setTimeout(() => func.apply(this, arguments), delay);
            };
        };
        this.input.addEventListener('input', debounce(listener, delayTime));
    }

    isValid() {
        if (!this || !this.input) return false;
        if (this.#config.validation === 'date' && this.input.value.trim().length < MAX_DATE_INPUT_LENGTH) {
            return false;
        }
        if (!this.required && !this.input.classList.contains('input__field_invalid')) return true;
        return this.input.value.trim() !== '' && !this.input.classList.contains('input__field_invalid');
    }

    validate() {
        if (!this.input) return;
        const value = this.input.value;

        if (this.#config.validation === 'email') {
            this.validateEmail(value);
        } else if (this.#config.validation === 'password') {
            this.input.minLength = MIN_PASSWORD_INPUT_LENGTH;
            this.validatePassword(value);
        } else if (this.#config.validation === 'username') {
            this.validateUsername(value);
        } else if (this.#config.validation === 'name') {
            this.validateName(value);
        } else if (this.#config.validation === 'date') {
            this.input.maxLength = MAX_DATE_INPUT_LENGTH;
            this.input.addEventListener('input', () => {
                if (!this.input) return;
                formatDateInput(this.input);
            }); // TODO
            if (value.length === MAX_DATE_INPUT_LENGTH) {
                this.validateDate(value);
            } else {
                this.hideError();
            }
        }
    }

    validateName(name: string) {
        const chars = Array.from(name);
        const hasValidCharacters = chars.every((char: any) => /^[\p{L}-]+$/u.test(char));

        if (!name) {
            this.showError('Введите ' + (this.#config.placeholder === 'Имя' ? 'имя' : 'фамилию'));
        } else if (!hasValidCharacters) {
            this.showError(this.#config.placeholder + ' может содержать только буквы и "-"');
        } else if (name.length < MIN_NAME_INPUT_LENGTH) {
            this.showError('Слишком ' + (this.#config.placeholder === 'Имя' ? 'короткое имя' : 'короткая фамилия'));
        } else {
            this.hideError();
        }
    }

    validateUsername(username: string) {
        const chars = Array.from(username);
        const hasValidCharacters = chars.every((char) => /^[a-zA-Z0-9._]+$/.test(char));

        if (!username) {
            this.showError('Введите имя пользователя');
        } else if (!hasValidCharacters) {
            this.showError('Имя пользователя может содержать только латинские буквы, цифры, "." и "_"');
        } else if (chars[0] === '.' || chars[0] === '_') {
            this.showError('Имя пользователя не должно начинаться с "." или "_"');
        } else {
            this.hideError();
        }
    }

    validateEmail(email: string) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email) && email) {
            this.showError('Некорректный Email');
        } else {
            this.hideError();
        }
    }

    validatePassword(password: string) {
        const chars = Array.from(password);
        const hasValidCharacters = chars.every((char) => /[A-Za-z0-9_/!@#$%^&*(),.?":{}|<>]/.test(char));
        const hasUppercase = chars.some((char) => /[A-Z]/.test(char));
        const hasLowercase = chars.some((char) => /[a-z]/.test(char));
        const hasNumeric = chars.some((char) => !isNaN(Number(char)) && char !== ' ');
        const hasSpecial = chars.some((char) => /[_/!@#$%^&*(),.?":{}|<>]/.test(char));

        if (!password) {
            this.showError('Введите пароль');
        } else if (!hasValidCharacters) {
            this.showError('Пароль содержит некорректные символы');
        } else if (password.length < MIN_PASSWORD_INPUT_LENGTH) {
            this.showError('Пароль должен содержать минимум 8 символов');
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

    validateDate(date: string) {
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

    showError(message: string) {
        if (
            !this.innnerWrapper ||
            !this.error ||
            !this.input
        ) return;

        this.innnerWrapper.appendChild(this.error);
        this.error.textContent = message;
        this.error.style.display = 'block';
        this.input.classList.add('input__field_invalid');
    }

    hideError() {
        if (
            !this.innnerWrapper ||
            !this.error ||
            !this.input
        ) return;

        if (this.input.classList.contains('input__field_invalid')) {
            this.innnerWrapper.removeChild(this.error);
            this.input.classList.remove('input__field_invalid');
        }
    }
}
