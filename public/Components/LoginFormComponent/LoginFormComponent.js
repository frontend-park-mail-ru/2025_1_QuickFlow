import Ajax from '../../modules/ajax.js';
import InputComponent from '../InputComponent/InputComponent.js';
import ButtonComponent from '../ButtonComponent/ButtonComponent.js';

export default class LoginFormComponent {
    constructor(container, menu) {
        this.container = container;
        this.menu = menu;
        this.step = 1;
        this.email = '';
        this.passwordInput = null;
        this.emailInput = null;

        this.continueBtn = null; // Кнопка "Продолжить"
        // this.errorMessage = null; // Сообщение об ошибке email
        this.config = {
            emailTitle: 'Вход QuickFlow',
            pwdTitle: 'Введите пароль',
            emailDescription: 'Введите логин, который привязан<br>к вашему аккаунту',
            pwdDescription: 'Введите ваш текущий пароль,<br>привязанный к @rvasutenko',
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
            this.renderEmailStep(form);
        } else if (this.step === 2) {
            this.renderPasswordStep(form);
        }

        this.container.appendChild(form);
    }

    renderTopWrapper(form) {
        const topWrapper = document.createElement('div');
        topWrapper.classList.add('auth-form-top');

        const logo = document.createElement('img');
        logo.src = '/static/img/logo-icon.svg';
        logo.classList.add('auth-form-logo');

        const title = document.createElement('h1');
        title.textContent = this.step === 1 ? this.config.emailTitle : this.config.pwdTitle;

        const description = document.createElement('p');
        description.classList.add('p1');
        description.innerHTML =
            this.step === 1 ? this.config.emailDescription : this.config.pwdDescription;

        topWrapper.appendChild(logo);
        topWrapper.appendChild(title);
        topWrapper.appendChild(description);

        form.appendChild(topWrapper);
    }

    renderBottomWrapper(form) {
        const bottomWrapper = document.createElement('div');
        bottomWrapper.classList.add('auth-form-bottom');
        form.appendChild(bottomWrapper);

        this.continueBtn = new ButtonComponent(bottomWrapper, {
            text: this.step === 1 ? this.config.continueBtnText : this.config.signinBtnText,
            variant: 'primary',
            onClick:
                this.step === 1
                    ? this.continueBtnOnClick.bind(this)
                    : this.signinBtnOnClick.bind(this),
            disabled: this.step === 1 // Кнопка "Продолжить" отключена на шаге email
        });
        this.continueBtn.render();

        if (this.step === 1) {
            const secondaryBtn = new ButtonComponent(bottomWrapper, {
                text: this.config.signupBtnText,
                variant: 'secondary',
                onClick: () => {
                    window.location.href = '/signup';
                }
            });
            secondaryBtn.render();
        }
    }

    renderEmailStep(form) {
        this.renderTopWrapper(form);

        const fieldsetEmail = document.createElement('fieldset');
        fieldsetEmail.classList.add('login-email');

        this.emailInput = new InputComponent(fieldsetEmail, {
            type: 'email',
            placeholder: 'Email',
            autocomplete: 'email',
            validation: 'email',
            required: true,
            showRequired: false
        });
        this.emailInput.render();

        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.classList.add('checkbox-wrapper');

        const rememberMe = document.createElement('input');
        rememberMe.type = 'checkbox';
        rememberMe.id = 'rememberMe';

        const label = document.createElement('label');
        label.htmlFor = 'rememberMe';
        label.textContent = 'Запомнить меня';

        checkboxWrapper.appendChild(rememberMe);
        checkboxWrapper.appendChild(label);
        fieldsetEmail.appendChild(checkboxWrapper);

        // Добавляем событие input для блокировки/разблокировки кнопки "Продолжить"
        this.emailInput.input.addEventListener('input', () => {
            if (
                this.emailInput.input.classList.contains('invalid') ||
                this.emailInput.input.value === ''
            ) {
                this.continueBtn.buttonElement.disabled = true;
            } else {
                this.continueBtn.buttonElement.disabled = false;
            }
        });

        form.appendChild(fieldsetEmail);
        this.renderBottomWrapper(form);
    }

    renderPasswordStep(form) {
        this.renderTopWrapper(form);

        this.passwordInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Пароль'
        });
        this.passwordInput.render();

        this.renderBottomWrapper(form);
    }

    continueBtnOnClick(event) {
        event.preventDefault();
        this.email = this.emailInput.input.value.trim();
        if (!this.email) {
            alert('Введите email!');
            return;
        }
        this.step = 2;
        this.render();
    }

    signinBtnOnClick(event) {
        event.preventDefault();
        const password = this.passwordInput.input.value.trim();
        if (!password) {
            alert('Введите пароль!');
            return;
        }
        this.submitLogin(password);
    }

    submitLogin(password) {
        Ajax.post({
            url: '/login',
            body: { email: this.email, password },
            callback: (status) => {
                if (status === 200) {
                    this.menu.goToPage(this.menu.menuElements.feed);
                } else {
                    this.passwordInput.showError('Неверный email или пароль');
                }
            }
        });
    }
}
