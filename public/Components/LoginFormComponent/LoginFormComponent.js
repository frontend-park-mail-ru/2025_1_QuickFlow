import Ajax from '../../modules/ajax.js';
import InputComponent from '../UI/InputComponent/InputComponent.js';
import ButtonComponent from '../UI/ButtonComponent/ButtonComponent.js';

export default class LoginFormComponent {
    constructor(container, menu) {
        this.container = container;
        this.menu = menu;
        this.step = 1;
        this.username = '';
        this.passwordInput = null;
        this.usernameInput = null;

        this.continueBtn = null; // Кнопка "Продолжить"
        this.config = {
            usernameTitle: 'Вход QuickFlow',
            pwdTitle: 'Введите пароль',
            usernameDescription: 'Введите имя пользователя, которое привязано к вашему аккаунту',
            pwdDescription: 'Введите ваш текущий пароль,<br>привязанный к ',
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
            this.renderUsernameStep(form);
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
        title.textContent = this.step === 1 ? this.config.usernameTitle : this.config.pwdTitle;

        const description = document.createElement('p');
        description.classList.add('p1');
        description.innerHTML =
            this.step === 1 ? this.config.usernameDescription : `${this.config.pwdDescription}@${this.usernameInput.input.value.trim()}`;

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
            disabled: this.step === 1
        });
        this.continueBtn.render();

        if (this.step === 1) {
            const secondaryBtn = new ButtonComponent(bottomWrapper, {
                text: this.config.signupBtnText,
                variant: 'secondary',
                onClick: () => {
                    this.menu.goToPage(this.menu.menuElements.signup);
                }
            });
            secondaryBtn.render();
        }
    }

    renderUsernameStep(form) {
        this.renderTopWrapper(form);

        const fieldsetUsername = document.createElement('fieldset');
        fieldsetUsername.classList.add('login-username');

        this.usernameInput = new InputComponent(fieldsetUsername, {
            type: 'text',
            placeholder: 'Имя пользователя',
            autocomplete: 'username',
            required: true,
            showRequired: false
        });
        this.usernameInput.render();

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
        fieldsetUsername.appendChild(checkboxWrapper);

        // Добавляем событие input для блокировки/разблокировки кнопки "Продолжить"
        this.usernameInput.input.addEventListener('input', () => {
            if (
                this.usernameInput.input.classList.contains('invalid') ||
                this.usernameInput.input.value === ''
            ) {
                this.continueBtn.buttonElement.disabled = true;
            } else {
                this.continueBtn.buttonElement.disabled = false;
            }
        });

        form.appendChild(fieldsetUsername);
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
        this.username = this.usernameInput.input.value.trim();
        if (!this.username) {
            alert('Введите имя пользователя!');
            return;
        }
        this.step = 2;
        this.render();
    }

    signinBtnOnClick(event) {
        event.preventDefault();
        const password = this.passwordInput.input.value.trim();
        if (!password) {
            alert('Введите пароль');
            return;
        }
        this.submitLogin(password);
    }

    submitLogin(password) {
        Ajax.post({
            url: '/login',
            body: {
                username: this.username,
                password
            },
            callback: (status) => {
                if (status === 200) {
                    this.menu.goToPage(this.menu.menuElements.feed);
                    this.menu.checkAuthPage();
                    this.menu.updateMenuVisibility(true);
                } else {
                    this.passwordInput.showError('Неверное имя пользователя или пароль');
                }
            }
        });
    }
}
