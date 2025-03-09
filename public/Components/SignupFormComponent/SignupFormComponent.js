import Ajax from '../../modules/ajax.js';
Handlebars.registerPartial('InputComponent', Handlebars.templates['InputComponent.hbs']);
Handlebars.registerPartial('RadioComponent', Handlebars.templates['RadioComponent.hbs']);
Handlebars.registerPartial('ButtonComponent', Handlebars.templates['ButtonComponent.hbs']);

export default class SignupFormComponent {
    constructor(container, menu) {
        this.container = container;
        this.menu = menu;
        this.step = 1;

        this.config = {
            emailTitle: 'Информация о себе',
            pwdTitle: 'Придумайте пароль',
            emailDescription: 'Введите логин, который привязан<br>к вашему аккаунту',
            pwdDescription: 'Или используйте пароль, предложенный устройством',
            continueBtnText: 'Продолжить',
            signupBtnText: 'Создать аккаунт'
        };

        this.render();
    }

    render() {
        const templateName = this.step === 1 ? 'SignupPersonalInfo.hbs' : 'SignupPassword.hbs';
        const template = Handlebars.templates[templateName];

        const html = template({
            emailTitle: this.config.emailTitle,
            emailDescription: this.config.emailDescription,
            pwdTitle: this.config.pwdTitle,
            pwdDescription: this.config.pwdDescription,
            continueBtnText: this.config.continueBtnText,
            signupBtnText: this.config.signupBtnText,
            sexOptions: {
                male: { id: 'radio-male', label: 'Мужской' },
                female: { id: 'radio-female', label: 'Женский' }
            }
        });

        this.container.innerHTML = html;
        this.#attachEvents();
    }

    #attachEvents() {
        if (this.step === 1) {
            this.usernameInput = this.container.querySelector('input[name="username"]');
            this.firstNameInput = this.container.querySelector('input[name="firstName"]');
            this.lastNameInput = this.container.querySelector('input[name="lastName"]');
            this.birthDateInput = this.container.querySelector('input[name="birthDate"]');
            this.sexInput = this.container.querySelector('input[name="sex"]');
            this.continueBtn = this.container.querySelector('.button-primary');

            this.usernameInput.addEventListener('input', () => this.updateContinueButtonState());
            this.firstNameInput.addEventListener('input', () => this.updateContinueButtonState());
            this.lastNameInput.addEventListener('input', () => this.updateContinueButtonState());
            this.birthDateInput.addEventListener('input', () => this.updateContinueButtonState());
            this.sexInput.addEventListener('change', () => this.updateContinueButtonState());

            this.continueBtn.addEventListener('click', () => this.continueBtnOnClick());
        } else {
            this.passwordInput = this.container.querySelector('input[name="password"]');
            this.passwordConfirmationInput = this.container.querySelector(
                'input[name="passwordConfirmation"]'
            );
            this.signupBtn = this.container.querySelector('.button-primary');

            this.passwordInput.addEventListener('input', () => this.validatePasswordConfirmation());
            this.passwordConfirmationInput.addEventListener('input', () =>
                this.validatePasswordConfirmation()
            );

            this.signupBtn.addEventListener('click', (event) => this.signupBtnOnClick(event));
        }
    }

    updateContinueButtonState() {
        const isValid =
            this.usernameInput.value.trim() &&
            this.firstNameInput.value.trim() &&
            this.lastNameInput.value.trim() &&
            this.birthDateInput.value.trim().length === 10 &&
            this.sexInput.checked;

        this.continueBtn.disabled = !isValid;
        this.continueBtn.classList.toggle('button-disabled', !isValid);
    }

    validatePasswordConfirmation() {
        const password = this.passwordInput.value.trim();
        const confirmPassword = this.passwordConfirmationInput.value.trim();
        const isValid = password && confirmPassword && password === confirmPassword;

        this.signupBtn.disabled = !isValid;
        this.signupBtn.classList.toggle('button-disabled', !isValid);
    }

    continueBtnOnClick() {
        this.step = 2;
        this.render();
    }

    signupBtnOnClick(event) {
        event.preventDefault();
        this.submitSignup();
    }

    submitSignup() {
        Ajax.post({
            url: '/signup',
            body: {
                email: this.usernameInput.value.trim(),
                password: this.passwordInput.value.trim(),
                age: 18
            },
            callback: (status) => {
                if (status === 200) {
                    this.menu.goToPage(this.menu.menuElements.feed);
                } else {
                    alert('Ошибка при регистрации');
                }
            }
        });
    }
}
