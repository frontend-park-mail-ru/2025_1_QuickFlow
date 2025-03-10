import Ajax from '../../modules/ajax.js';
import InputComponent from '../UI/InputComponent/InputComponent.js';
import RadioComponent from '../UI/RadioComponent/RadioComponent.js';
import ButtonComponent from '../UI/ButtonComponent/ButtonComponent.js';

export default class SignupFormComponent {
    constructor(container, menu) {
        this.container = container;
        this.menu = menu;

        this.step = 1;

        this.usernameInput = null;
        this.firstNameInput = null;
        this.lastNameInput = null;
        this.sexInput = null;
        this.birthDateInput = null;
        this.passwordInput = null;
        this.passwordConfirmationInput = null;

        this.continueBtn = null;

        this.config = {
            userInfoTitle: 'Информация о себе',
            pwdTitle: 'Придумайте пароль',
            userInfoDescription: 'Введите логин, который привязан<br>к вашему аккаунту',
            pwdDescription: 'Или используйте пароль, предложенный устройством',
            continueBtnText: 'Продолжить',
            signupBtnText: 'Создать аккаунт',
            signinBtnText: 'Войти'
        };
        this.render();
    }

    render() {
        this.container.innerHTML = '';

        const form = document.createElement('form');
        form.classList.add('auth-form');

        if (this.step === 1) {
            this.renderPersonalInfoStep(form);
        } else if (this.step === 2) {
            this.renderCreatePasswordStep(form);
        }

        this.container.appendChild(form);
    }

    renderTopWrapper(form) {
        const topWrapper = document.createElement('div');
        topWrapper.classList.add('auth-form-top');

        if (this.step === 2) {
            const logo = document.createElement('img');
            logo.src = '/static/img/logo-icon.svg';
            logo.classList.add('auth-form-logo');
            topWrapper.appendChild(logo);
        }

        const title = document.createElement('h1');
        title.textContent = this.step === 1 ? this.config.userInfoTitle : this.config.pwdTitle;
        topWrapper.appendChild(title);

        if (this.step === 2) {
            const description = document.createElement('p');
            description.classList.add('p1');
            description.innerHTML =
                this.step === 1 ? this.config.userInfoDescription : this.config.pwdDescription;
            topWrapper.appendChild(description);
        }

        form.appendChild(topWrapper);
    }

    renderBottomWrapper(form) {
        const bottomWrapper = document.createElement('div');
        bottomWrapper.classList.add('auth-form-bottom');
        form.appendChild(bottomWrapper);

        this.continueBtn = new ButtonComponent(bottomWrapper, {
            text: this.config.continueBtnText,
            variant: 'primary',
            onClick:
                this.step === 1
                    ? this.continueBtnOnClick.bind(this)
                    : this.signupBtnOnClick.bind(this),
            disabled: true
        });

        this.continueBtn.render();
    }

    renderPersonalInfoStep(form) {
        this.renderTopWrapper(form);

        const fieldsetPersonalInfo = document.createElement('fieldset');
        fieldsetPersonalInfo.classList.add('signup-personal-info');

        this.usernameInput = new InputComponent(fieldsetPersonalInfo, {
            type: 'text',
            label: 'Имя пользователя',
            placeholder: 'Имя пользователя',
            autocomplete: 'username',
            validation: 'username',
            required: true,
            showRequired: false
        });
        this.usernameInput.render();

        const nameInputWrapper = document.createElement('div');
        nameInputWrapper.classList.add('signup-name-input-wrapper');
        fieldsetPersonalInfo.appendChild(nameInputWrapper);

        this.firstNameInput = new InputComponent(nameInputWrapper, {
            type: 'text',
            label: 'Имя',
            placeholder: 'Имя',
            autocomplete: 'username',
            required: true,
            showRequired: false
        });
        this.firstNameInput.render();

        this.lastNameInput = new InputComponent(nameInputWrapper, {
            type: 'text',
            label: 'Фамилия',
            placeholder: 'Фамилия',
            autocomplete: 'username',
            required: true,
            showRequired: false
        });
        this.lastNameInput.render();

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
        this.sexInput.render();

        this.birthDateInput = new InputComponent(fieldsetPersonalInfo, {
            type: 'text',
            label: 'Дата рождения',
            placeholder: 'дд.мм.гггг',
            autocomplete: 'date',
            validation: 'date',
            required: true,
            showRequired: false
        });
        this.birthDateInput.render();

        const textInputs = [
            this.usernameInput,
            this.firstNameInput,
            this.lastNameInput,
            this.birthDateInput
        ];

        const radioInputs = [this.sexInput];

        this.usernameInput.input.addEventListener(
            'input',
            this.updateContinueButtonState.bind(this, textInputs, radioInputs)
        );
        this.firstNameInput.input.addEventListener(
            'input',
            this.updateContinueButtonState.bind(this, textInputs, radioInputs)
        );
        this.lastNameInput.input.addEventListener(
            'input',
            this.updateContinueButtonState.bind(this, textInputs, radioInputs)
        );
        this.birthDateInput.input.addEventListener(
            'input',
            this.updateContinueButtonState.bind(this, textInputs, radioInputs)
        );
        this.sexInput.wrapper.addEventListener(
            'change',
            this.updateContinueButtonState.bind(this, textInputs, radioInputs)
        );

        form.appendChild(fieldsetPersonalInfo);
        this.renderBottomWrapper(form);
    }

    renderCreatePasswordStep(form) {
        this.renderTopWrapper(form);

        this.passwordInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Введите пароль',
            validation: 'password',
            required: true,
            showRequired: false
        });
        this.passwordInput.render();

        this.passwordConfirmationInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Повторите пароль',
            validation: 'password',
            required: true,
            showRequired: false
        });
        this.passwordConfirmationInput.render();

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
        // event.preventDefault();
        // this.email = this.usernameInput.input.value.trim();
        // if (!this.email) {
        //     alert('Введите email!');
        //     return;
        // }
        this.step = 2;
        this.render();
    }

    signupBtnOnClick(event) {
        event.preventDefault();
        this.submitSignup();
    }

    convertDate(dateString) {
        console.log(this.sexInput.getChecked().value);
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
            firstname: this.firstNameInput.input.value.trim(),
            lastname: this.lastNameInput.input.value.trim(),
            sex: this.sexInput.getChecked().value === 'male' ? 1 : 2, 
            birth_date: this.convertDate(this.birthDateInput.input.value.trim()),
        }
        console.log(body);
        Ajax.post({
            url: '/signup',
            body: body,
            callback: (status) => {
                if (status === 200) {
                    this.menu.goToPage(this.menu.menuElements.feed);
                    this.menu.checkAuthPage();
                    this.menu.updateMenuVisibility(true);
                } else {
                    this.passwordInput.showError('Что-то пошло не так :((');
                }
            }
        });
    }
}
