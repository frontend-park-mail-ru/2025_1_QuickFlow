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
        this.firstnameInput = null;
        this.lastnameInput = null;
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

        const backBtn = document.createElement('a');
        backBtn.classList.add('auth-form-back-btn');
        topWrapper.appendChild(backBtn);
        backBtn.addEventListener('click', () => {
            if (this.step === 1) {
                localStorage.removeItem("username");
                localStorage.removeItem("firstname");
                localStorage.removeItem("lastname");
                localStorage.removeItem("sex");
                localStorage.removeItem("birthDate");
                this.menu.goToPage(this.menu.menuElements.login);
            } else {
                this.step = 1;
                this.render();
            }
        });

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
            disabled: true,
            stateUpdaters: 
                this.step === 1
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

        const fieldsetPersonalInfo = document.createElement('fieldset');
        fieldsetPersonalInfo.classList.add('signup-personal-info');

        this.usernameInput = new InputComponent(fieldsetPersonalInfo, {
            type: 'text',
            label: 'Имя пользователя',
            placeholder: 'Имя пользователя',
            autocomplete: 'username',
            maxLength: 20,
            validation: 'username',
            required: true,
            showRequired: false
        });
        this.usernameInput.input.value = localStorage.getItem("username") || '';

        const nameInputWrapper = document.createElement('div');
        nameInputWrapper.classList.add('signup-name-input-wrapper');
        fieldsetPersonalInfo.appendChild(nameInputWrapper);

        this.firstnameInput = new InputComponent(nameInputWrapper, {
            type: 'text',
            label: 'Имя',
            placeholder: 'Имя',
            maxLength: 25,
            validation: 'name',
            required: true,
            showRequired: false
        });
        this.firstnameInput.input.value = localStorage.getItem("firstname") || '';

        this.lastnameInput = new InputComponent(nameInputWrapper, {
            type: 'text',
            label: 'Фамилия',
            placeholder: 'Фамилия',
            maxLength: 25,
            validation: 'name',
            required: true,
            showRequired: false
        });
        this.lastnameInput.input.value = localStorage.getItem("lastname") || '';

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
            showRequired: false
        });
        this.birthDateInput.input.value = localStorage.getItem("birthDate") || '';

        // const textInputs = [
        //     this.usernameInput,
        //     this.firstnameInput,
        //     this.lastnameInput,
        //     this.birthDateInput
        // ];

        // const radioInputs = [this.sexInput];

        // this.usernameInput.input.addEventListener(
        //     'input',
        //     this.updateContinueButtonState.bind(this, textInputs, radioInputs)
        // );
        // this.firstnameInput.input.addEventListener(
        //     'input',
        //     this.updateContinueButtonState.bind(this, textInputs, radioInputs)
        // );
        // this.lastnameInput.input.addEventListener(
        //     'input',
        //     this.updateContinueButtonState.bind(this, textInputs, radioInputs)
        // );
        // this.birthDateInput.input.addEventListener(
        //     'input',
        //     this.updateContinueButtonState.bind(this, textInputs, radioInputs)
        // );
        // this.sexInput.wrapper.addEventListener(
        //     'change',
        //     this.updateContinueButtonState.bind(this, textInputs, radioInputs)
        // );

        form.appendChild(fieldsetPersonalInfo);
        this.renderBottomWrapper(form);

        // this.updateContinueButtonState(textInputs, radioInputs);
    }

    renderCreatePasswordStep(form) {
        this.renderTopWrapper(form);

        this.passwordInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Введите пароль',
            maxLength: 32,
            validation: 'password',
            required: true,
            showRequired: false
        });

        this.passwordConfirmationInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Повторите пароль',
            maxLength: 32,
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
        this.step = 2;
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
