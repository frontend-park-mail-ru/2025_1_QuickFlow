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
const YEAR_INPUT_MIN = 1925;
const YEAR_INPUT_MAX = 2050;


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

        if (this.#config.label) {
            const label = createElement({
                tag: 'label',
                text: this.#config.label,
                parent: this.wrapper,
                classes: ['input__label'],
            });
            if (this.#config.showRequired) {
                createElement({
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

        this.input = createElement({
            tag: 'input',
            parent: this.innnerWrapper,
            classes: ['input__field'],
            attrs: {
                autocomplete: this.#config.autocomplete || DEFAULT_AUTOCOMPLETE,
                placeholder: this.#config.placeholder || DEFAULT_PLACEHOLDER,
                maxLength: this.#config.maxLength || DEFAULT_MAX_LENGTH,
                value: this.formatValue(this.#config.value) || DEFAULT_INPUT_VALUE,
                name: this.name || DEFAULT_NAME,
            },
        }) as HTMLInputElement;

        this.input.setAttribute("type",
            this.#config.type === 'number' ?
            DEFAULT_TYPE :
            (this.#config.type || DEFAULT_TYPE)
        );

        if (this.required) {
            this.input.setAttribute('required', '');
        }

        this.error = createElement({
            classes: ['input__error'],
        });

        if (this.#config.type === 'password') {
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
        } else if (this.#config.type === 'search') {
            createElement({
                parent: this.innnerWrapper,
                classes: ['input__search-icon'],
            });
        } else if (this.#config.type === 'number') {
            this.input.addEventListener('input', () => {
                this.input.value = this.value.replace(/\D/g, '');
            });
        }

        if (this.#config.validation) {
            this.input.addEventListener('input', () => this.validate());
        }

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

    formatValue(value: string): string {
        switch (this.#config.validation) {
            case "phone":
                return this.formatPhoneInput(value);
            default:
                return value;
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

        if (
            this.#config.validation === 'date' &&
            this.input.value.trim().length < MAX_DATE_INPUT_LENGTH
        ) return false;

        if (
            !this.required &&
            !this.input.classList.contains('input__field_invalid')
        ) return true;

        return this.input.value.trim() !== '' && !this.input.classList.contains('input__field_invalid');
    }

    validate() {
        if (!this.input) return;

        const value = this.input.value;

        switch (this.#config.validation) {
            case 'email':
                this.validateEmail(value);
                break;
            case 'password':
                this.validatePassword(value);
                break;
            case 'username':
                this.validateUsername(value);
                break;
            case 'name':
                this.validateName(value);
                break;
            case 'date':
                this.validateDate(value);
                break;
            case 'year':
                this.validateYear(value);
                break;
            case 'phone':
                this.validatePhone(value);
                break;
        }
    }

    validatePhone(phone: string) {
        this.input.maxLength = 16;
        this.input.value = this.formatPhoneInput(this.value);
        
        const raw = phone.replace(/\D/g, '');
    
        if (!raw && !this.#config.required) return this.hideError();

        if (!raw) {
            this.showError('Введите номер телефона');
        } else if (raw.length !== 11 || !raw.startsWith('7')) {
            this.showError('Введите корректный российский номер телефона');
        } else this.hideError();
    }

    formatPhoneInput(phone: string): string {
        const raw = phone.replace(/\D/g, '');

        // Ограничим 11 цифрами
        let digits = raw.slice(0, 11);

        // Удаляем первую 8 и заменяем на 7
        if (digits[0] === '8') {
            digits = '7' + digits.slice(1);
        }

        // Форматируем по шаблону +7 999 999-99-99
        let formatted = '+7';
        if (digits.length === 0) formatted = '';
        if (digits.length > 1) {
            formatted += ' ' + digits.slice(1, 4);
        }
        if (digits.length >= 4) {
            if (digits.length !== 4) formatted += ' ' + digits.slice(4, 7);
        }
        if (digits.length >= 7) {
            if (digits.length !== 7) formatted += '-' + digits.slice(7, 9);
        }
        if (digits.length >= 9) {
            if (digits.length !== 9) formatted += '-' + digits.slice(9, 11);
        }

        return formatted;
    }    

    validateYear(value: string) {
        this.input.maxLength = 4;

        const year = Number(value);

        if (!isNaN(year)) {
            if (year < this.#config.min) {
                this.showError(`Год не может быть меньше ${this.#config.min}`);
            } else if (year > this.#config.max) {
                this.showError(`Год не может быть больше ${this.#config.max}`);
            } else this.hideError();
        }

        if (
            !this.#config.required &&
            !this.value
        ) this.hideError();
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
        this.input.minLength = MIN_PASSWORD_INPUT_LENGTH;

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
        } else this.hideError();
    }

    validateDate(date: string) {
        this.input.maxLength = MAX_DATE_INPUT_LENGTH;
        formatDateInput(this.input);
        if (this.value.length !== MAX_DATE_INPUT_LENGTH) return this.hideError();

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
