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
const DEFAULT_MIN_BIRTH_YEAR = 1900;


interface InputConfig {
    suggestions?: string[];
    name?: string;
    required?: boolean;
    classes?: Array<string>;
    autocomplete?: string;
    placeholder?: string;
    type?: string;
    value?: string;
    maxLength?: number;
    validator?: (value: string) => { result: boolean; message?: string; };
    showRequired?: boolean;
    description?: string;
    validation?: string;
    showCharactersLeft?: boolean;
    label?: string;
    entity?: string;
    min?: number;
    max?: number;
}


export default class InputComponent {
    private parent: HTMLElement;
    private _config: InputConfig;

    private suggestionsList: HTMLElement | null = null;
    private currentSuggestions: string[] = [];
    input: HTMLInputElement | null = null;
    error: HTMLElement | null = null;
    wrapper: HTMLElement | null = null;
    innnerWrapper: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: InputConfig) {
        this._config = config;
        this.parent = parent;
        this.render();
    }

    get config() {
        return this._config;
    }

    get value() {
        if (!this.input) return;
        return this.input.value.trim();
    }

    get name() {
        return this._config.name?.trim();
    }

    get required() {
        return this._config.required;
    }

    isEmpty() {
        if (!this.input) return;
        return this.input.value.trim() === '';
    }

    render() {
        this.wrapper = createElement({
            parent: this.parent,
            classes: ['input'],
        });

        if (this._config.classes) {
            const _classes: Array<string> = Array.from(this._config.classes);
            if (_classes.length) this.wrapper.classList.add(..._classes);
        }

        this.renderHeader();
        
        this.innnerWrapper = createElement({
            parent: this.wrapper,
            classes: ['input__inner'],
        });

        this.input = createElement({
            tag: 'input',
            parent: this.innnerWrapper,
            classes: ['input__field'],
            attrs: {
                autocomplete: this._config.autocomplete || DEFAULT_AUTOCOMPLETE,
                placeholder: this._config.placeholder || DEFAULT_PLACEHOLDER,
                maxLength: this._config.maxLength || DEFAULT_MAX_LENGTH,
                value: this.formatValue(this._config.value) || DEFAULT_INPUT_VALUE,
                name: this.name || DEFAULT_NAME,
            },
        }) as HTMLInputElement;

        if (this._config.suggestions?.length) {
            this.initSuggestions();
        }

        this.input.setAttribute("type",
            this._config.type === 'number' ?
            DEFAULT_TYPE :
            (this._config.type || DEFAULT_TYPE)
        );

        if (this.required) this.input.setAttribute('required', '');

        this.error = createElement({
            classes: ['input__error'],
        });

        switch (this._config.type) {
            case 'password':
                this.setPasswordInitOptions();
                break;
            case 'search':
                this.setSearchInitOptions();
                break;
            case 'number':
                this.setNumberInitOptions();
                break;
        }

        if (this._config.validator) {
            this.input.addEventListener('input', () => this.checkValue());
            if (this._config.value) {
                this.checkValue();
            }
        } else if (this._config.validation) {
            this.input.addEventListener('input', () => this.validate());
            if (this._config.value) {
                this.validate();
            }
        }

        this.renderBottom();
    }

    private initSuggestions() {
        if (!this.innnerWrapper || !this.input) return;
    
        this.suggestionsList = createElement({
            parent: this.innnerWrapper,
            classes: ['input__suggestions', 'hidden'],
        });

        this.input.addEventListener('focus', () => {
            const inputValue = this.input!.value.toLowerCase();
            this.currentSuggestions = this._config.suggestions.filter(
                (item: string) => item.toLowerCase().includes(inputValue)
            );

            if (this.currentSuggestions.length === 0) {
                this.suggestionsList.classList.add('hidden');   
                return;
            }

            this.suggestionsList.classList.remove('hidden');    
            this.renderSuggestions();
        });
    
        this.input.addEventListener('input', () => {
            const inputValue = this.input!.value.toLowerCase();
            this.currentSuggestions = this._config.suggestions.filter(
                (item: string) => item.toLowerCase().includes(inputValue)
            );

            if (this.currentSuggestions.length === 0) {
                this.suggestionsList.classList.add('hidden');   
                return;
            }

            this.suggestionsList.classList.remove('hidden');    
            this.renderSuggestions();
        });
    
        document.addEventListener('click', (e) => {
            if (
                this.suggestionsList &&
                !this.suggestionsList.contains(e.target as Node) &&
                e.target !== this.input
            ) {
                this.clearSuggestions();
            }
        });
    }

    private renderSuggestions() {
        if (!this.suggestionsList) return;
    
        this.suggestionsList.innerHTML = '';
    
        this.currentSuggestions.forEach((suggestion) => {
            const item = createElement({
                text: suggestion,
                parent: this.suggestionsList,
                classes: ['input__suggestion'],
            });
    
            item.addEventListener('click', () => {
                if (this.input) {
                    this.input.value = suggestion;
                    this.clearSuggestions();
                    this.input.dispatchEvent(new Event('input')); // триггерим валидацию
                }
            });
        });
    
        if (this.currentSuggestions.length) {
            this.suggestionsList.style.display = 'block';
        } else {
            this.clearSuggestions();
        }
    }
    
    private clearSuggestions() {
        if (this.suggestionsList) {
            this.suggestionsList.innerHTML = '';
            // this.suggestionsList.style.display = 'none';
            this.suggestionsList.classList.add('hidden');
        }
    }

    



    

    checkValue(): boolean | string {
        const validationResult = this.config.validator(this.value);
    
        if (!validationResult.result) {
            this.showError(validationResult.message || '');
            return false;
        }
    
        this.hideError();
        return true;
    }

    renderBottom() {
        if (!this._config.description && !this._config.maxLength) return;
        
        const descWrapper = createElement({
            parent: this.wrapper,
            classes: ['input__description-wrapper'],
        });

        if (this._config.description) {
            createElement({
                tag: 'span',
                text: this._config.description,
                parent: descWrapper,
                classes: ['input__description'],
            });
        }

        if (this._config.showCharactersLeft) {
            const counter = createElement({
                tag: 'span',
                text: this._config.maxLength,
                parent: descWrapper,
                classes: ['input__counter'],
            });

            this.input.addEventListener('input', () => {
                if (!this.input) return;
                counter.textContent = (this._config.maxLength - this.input.value.length).toString();
            });
        }
    }

    private renderHeader() {
        if (!this._config.label) return;

        const label = createElement({
            tag: 'label',
            text: this._config.label,
            parent: this.wrapper,
            classes: ['input__label'],
        });

        if (!this._config.showRequired) return;

        createElement({
            tag: 'span',
            text: REQUIRED_MARK_TEXT,
            parent: label,
            classes: ['input__required'],
        });
    }

    private setNumberInitOptions() {
        this.input.addEventListener('input', () => {
            this.input.value = this.value.replace(/\D/g, '');
        });
    }

    private setSearchInitOptions() {
        createElement({
            parent: this.innnerWrapper,
            classes: ['input__search-icon'],
        });
    }

    private setPasswordInitOptions() {
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
    }

    private formatValue(value: string): string {
        switch (this._config.validation) {
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
            this._config.validation === 'date' &&
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

        switch (this._config.validation) {
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

    private validatePhone(phone: string) {
        this.input.maxLength = 16;
        this.input.value = this.formatPhoneInput(this.value);
        
        const raw = phone.replace(/\D/g, '');
    
        if (!raw && !this._config.required) return this.hideError();

        if (!raw) {
            this.showError('Введите номер телефона');
        } else if (raw.length !== 11 || !raw.startsWith('7')) {
            this.showError('Введите корректный российский номер телефона');
        } else this.hideError();
    }

    private formatPhoneInput(phone: string): string {
        if (!phone) return '';
        
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

    private validateYear(value: string) {
        this.input.maxLength = 4;

        const year = Number(value);

        if (!isNaN(year)) {
            if (year < this._config.min) {
                this.showError(`Год не может быть меньше ${this._config.min}`);
            } else if (year > this._config.max) {
                this.showError(`Год не может быть больше ${this._config.max}`);
            } else this.hideError();
        }

        if (
            !this._config.required &&
            !this.value
        ) this.hideError();
    }

    private validateName(name: string) {
        const chars = Array.from(name);
        const hasValidCharacters = chars.every((char: any) => /^[\p{L}-]+$/u.test(char));

        if (!name) {
            this.showError('Введите ' + (this._config.placeholder === 'Имя' ? 'имя' : 'фамилию'));
        } else if (!hasValidCharacters) {
            this.showError(this._config.placeholder + ' может содержать только буквы и "-"');
        } else if (name.length < MIN_NAME_INPUT_LENGTH) {
            this.showError('Слишком ' + (this._config.placeholder === 'Имя' ? 'короткое имя' : 'короткая фамилия'));
        } else {
            this.hideError();
        }
    }

    private validateUsername(username: string) {
        const chars = Array.from(username);
        const hasValidCharacters = chars.every((char) => /^[a-zA-Z0-9._]+$/.test(char));

        if (!username) {
            this.showError(
                'Введите '
                + (this.config?.entity?.toLowerCase() || 'имя пользователя')
            );
        } else if (!hasValidCharacters) {
            this.showError(
                (this.config?.entity || 'Имя пользователя')
                + ' может содержать только латинские буквы, цифры, "." и "_"'
            );
        } else if (chars[0] === '.' || chars[0] === '_') {
            this.showError(
                (this.config?.entity ?
                    (this.config?.entity + ' не должен') :
                    'Имя пользователя не должно')
                + ' начинаться с "." или "_"'
            );
        } else {
            this.hideError();
        }
    }

    private validateEmail(email: string) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email) && email) {
            this.showError('Некорректный Email');
        } else {
            this.hideError();
        }
    }

    private validatePassword(password: string) {
        this.input.minLength = MIN_PASSWORD_INPUT_LENGTH;

        const chars = Array.from(password);
        const hasValidCharacters = chars.every((char) => /[A-Za-z0-9_/!@#$%^&*(),.?":{}|<>]/.test(char));
        const hasUppercase = chars.some((char) => /[A-Z]/.test(char));
        const hasLowercase = chars.some((char) => /[a-z]/.test(char));
        const hasNumeric = chars.some((char) => !isNaN(Number(char)) && char !== ' ');
        // const hasSpecial = chars.some((char) => /[_/!@#$%^&*(),.?":{}|<>]/.test(char));

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
        } else this.hideError();
        
        // else if (!hasSpecial) {
        //     this.showError('Пароль должен содержать хотя бы один спецсимвол');
        // }
    }

    private validateDate(date: string) {
        this.input.maxLength = MAX_DATE_INPUT_LENGTH;
        formatDateInput(this.input);
        
        if (this.value.length !== MAX_DATE_INPUT_LENGTH)
            return this.hideError();

        const datePattern = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(\d{4})$/;

        if (!datePattern.test(date))
            return this.showError('Некорректный формат даты');

        const [day, month, year] = date.split('.').map(Number);
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();

        if (year < DEFAULT_MIN_BIRTH_YEAR)
            return this.showError(`Дата не должна быть ранее ${DEFAULT_MIN_BIRTH_YEAR} года`);
        
        if (inputDate > today)
            return this.showError('Дата не должна быть в будущем');

        if (
            inputDate.getDate() !== day ||
            inputDate.getMonth() + 1 !== month ||
            inputDate.getFullYear() !== year
        ) return this.showError('Некорректная дата');

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
