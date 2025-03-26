import Ajax from '../../modules/ajax.js';
import InputComponent from '../UI/InputComponent/InputComponent.js';
import RadioComponent from '../UI/RadioComponent/RadioComponent.js';
import ButtonComponent from '../UI/ButtonComponent/ButtonComponent.js';
import createElement from '../../utils/createElement.js';


const LOGO_SRC = '/static/img/logo-icon.svg';
const DEFAULT_INPUT_VALUE = '';
const CREATION_ERROR_MESSAGE = 'Не удалось создать аккаунт';
const USER_INFO_TITLE = 'Информация о себе';
const PWD_TITLE = 'Придумайте пароль';
const PWD_TEXT = 'Или используйте пароль, предложенный устройством';
const CONTINUE_BTN_TEXT = 'Продолжить';
const PWD_INPUT_MAX_LENGTH = 32;


export default class SignupFormComponent {
    #parent
    #step
    #menu
    #header
    constructor(parent, menu, header) {
        this.#parent = parent;
        this.#menu = menu;
        this.#header = header;

        this.usernameInput = null;
        this.firstnameInput = null;
        this.lastnameInput = null;
        this.sexInput = null;
        this.birthDateInput = null;
        this.passwordInput = null;
        this.passwordConfirmationInput = null;

        this.continueBtn = null;

        this.#step = 1;
        this.render();
    }

    render() {
        this.#parent.innerHTML = '';

        const form = createElement({
            tag: 'form',
            parent: this.#parent,
            classes: ['auth-form']
        });

        if (this.#step === 1) {
            this.renderPersonalInfoStep(form);
        } else if (this.#step === 2) {
            this.renderCreatePasswordStep(form);
        }
    }

    renderTopWrapper(form) {
        const topWrapper = createElement({
            parent: form,
            classes: ['auth-form-top']
        });

        createElement({
            tag: 'a',
            parent: topWrapper,
            classes: ['auth-form-back-btn']
        })
        .addEventListener('click', () => {
            if (this.#step === 1) {
                localStorage.removeItem("username");
                localStorage.removeItem("firstname");
                localStorage.removeItem("lastname");
                localStorage.removeItem("sex");
                localStorage.removeItem("birthDate");
                this.#menu.goToPage(this.#menu.menuElements.login);
            } else {
                this.#step = 1;
                this.render();
            }
        });

        if (this.#step === 2) {
            createElement({
                parent: topWrapper,
                classes: ['auth-form-logo'],
                attrs: {src: LOGO_SRC}
            })
        }

        createElement({
            tag: 'h1',
            parent: topWrapper,
            text: this.#step === 1 ? USER_INFO_TITLE : PWD_TITLE
        })

        if (this.#step === 2) {
            createElement({
                tag: 'p',
                parent: topWrapper,
                classes: ['p1'],
                text: PWD_TEXT,
            })
        }
    }

    renderBottomWrapper(form) {
        const bottomWrapper = createElement({
            parent: form,
            classes: ['auth-form-bottom'],
        })

        this.continueBtn = new ButtonComponent(bottomWrapper, {
            text: CONTINUE_BTN_TEXT,
            variant: 'primary',
            onClick:
                this.#step === 1
                    ? this.continueBtnOnClick.bind(this)
                    : this.signupBtnOnClick.bind(this),
            disabled: true,
            stateUpdaters: 
                this.#step === 1
                ? [
                    this.usernameInput,
                    this.firstnameInput,
                    this.lastnameInput,
                    this.birthDateInput,
                    this.sexInput
                ]
                : [
                    this.passwordInput,
                    this.passwordConfirmationInput
                ]
        });
    }

    renderPersonalInfoStep(form) {
        this.renderTopWrapper(form);

        const fieldsetPersonalInfo = createElement({
            tag: 'fieldset',
            parent: form,
            classes: ['signup-personal-info'],
        })

        this.usernameInput = new InputComponent(fieldsetPersonalInfo, {
            type: 'text',
            label: 'Имя пользователя',
            placeholder: 'Имя пользователя',
            autocomplete: 'username',
            maxLength: 20,
            validation: 'username',
            required: true,
            showRequired: false,
            value: localStorage.getItem("username") || DEFAULT_INPUT_VALUE
        });

        const nameInputWrapper = createElement({
            parent: fieldsetPersonalInfo,
            classes: ['signup-name-input-wrapper'],
        })

        this.firstnameInput = new InputComponent(nameInputWrapper, {
            type: 'text',
            label: 'Имя',
            placeholder: 'Имя',
            maxLength: 25,
            validation: 'name',
            required: true,
            showRequired: false,
            value: localStorage.getItem("firstname") || DEFAULT_INPUT_VALUE,
        });

        this.lastnameInput = new InputComponent(nameInputWrapper, {
            type: 'text',
            label: 'Фамилия',
            placeholder: 'Фамилия',
            maxLength: 25,
            validation: 'name',
            required: true,
            showRequired: false,
            value: localStorage.getItem("lastname") || DEFAULT_INPUT_VALUE,
        });

        this.sexInput = new RadioComponent(fieldsetPersonalInfo, {
            label: 'Пол',
            name: 'sex',
            radios: {
                male: {
                    id: 'radio-male',
                    value: 'male',
                    label: 'Мужской'
                },
                female: {
                    id: 'radio-female',
                    value: 'female',
                    label: 'Женский'
                }
            },
            required: true,
            showRequired: false
        });
        this.sexInput.setChecked(localStorage.getItem("sex"));

        this.birthDateInput = new InputComponent(fieldsetPersonalInfo, {
            type: 'text',
            label: 'Дата рождения',
            placeholder: 'дд.мм.гггг',
            autocomplete: 'date',
            validation: 'date',
            required: true,
            showRequired: false,
            value: localStorage.getItem("birthDate") || DEFAULT_INPUT_VALUE,
        });

        this.renderBottomWrapper(form);
    }

    renderCreatePasswordStep(form) {
        this.renderTopWrapper(form);

        this.passwordInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Введите пароль',
            maxLength: PWD_INPUT_MAX_LENGTH,
            validation: 'password',
            required: true,
            showRequired: false
        });

        this.passwordConfirmationInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Повторите пароль',
            maxLength: PWD_INPUT_MAX_LENGTH,
            validation: 'password',
            required: true,
            showRequired: false
        });

        const textInputs = [this.passwordInput, this.passwordConfirmationInput];

        this.passwordConfirmationInput.input.addEventListener('input', () => {
            this.passwordInput.input.addEventListener('input', () => {
                this.validatePasswordConfirmation();
                this.updateContinueButtonState(textInputs, []);
            });
            this.validatePasswordConfirmation();
            this.updateContinueButtonState(textInputs, []);
        });

        this.renderBottomWrapper(form);
    }

    updateContinueButtonState(inputs, radios) {
        const isInputsValid = inputs.every((input) => {
            if (!input || !input.input) {
                return false;
            }
            if (input.config.validation === 'date' && input.input.value.trim().length < 10) {
                return false;
            }
            return input.input.value.trim() !== '' && !input.input.classList.contains('invalid');
        });

        // Проверяем, выбран ли хотя бы один radio-кнопка
        const isRadiosSelected = radios.every((radio) => {
            if (!radio) return false;
            return radio.wrapper.querySelector('input[type="radio"]:checked') !== null;
        });

        // Разблокируем кнопку, если все поля заполнены и валидны
        this.continueBtn.buttonElement.disabled = !(isInputsValid && isRadiosSelected);
    }

    validatePasswordConfirmation() {
        const password = this.passwordInput.input.value.trim();
        const confirmPassword = this.passwordConfirmationInput.input.value.trim();

        if (password !== confirmPassword) {
            this.passwordConfirmationInput.showError('Пароли не совпадают');
            return false;
        } else {
            this.passwordConfirmationInput.hideError();
            return true;
        }
    }

    continueBtnOnClick() {
        localStorage.setItem("username", this.usernameInput.input.value.trim());
        localStorage.setItem("firstname", this.firstnameInput.input.value.trim());
        localStorage.setItem("lastname", this.lastnameInput.input.value.trim());
        localStorage.setItem("sex", this.sexInput.getChecked().value);
        localStorage.setItem("birthDate", this.birthDateInput.input.value.trim());
        this.#step = 2;
        this.render();
    }

    signupBtnOnClick(event) {
        event.preventDefault();
        this.submitSignup();
    }

    convertDate(dateString) {
        const parts = dateString.split('.');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }

    submitSignup() {
        const body = {
            username: this.usernameInput.input.value.trim(),
            password: this.passwordInput.input.value.trim(),
            firstname: this.firstnameInput.input.value.trim(),
            lastname: this.lastnameInput.input.value.trim(),
            sex: this.sexInput.getChecked().value === 'male' ? 1 : 2, 
            birth_date: this.convertDate(this.birthDateInput.input.value.trim()),
        }
        Ajax.post({
            url: '/signup',
            body: body,
            callback: (status) => {
                if (status === 200) {
                    this.#menu.goToPage(this.#menu.menuElements.feed);
                    this.#menu.checkAuthPage();
                    this.#menu.updateMenuVisibility(true);
                    this.#header.renderAvatarMenu();
                } else {
                    this.passwordInput.showError(CREATION_ERROR_MESSAGE);
                }
            }
        });
    }
}
