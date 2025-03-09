import Ajax from '../../modules/ajax.js';
// import InputComponent from '../InputComponent/InputComponent.js';
// import ButtonComponent from '../ButtonComponent/ButtonComponent.js';

export default class LoginFormComponent {
    constructor(container, menu) {
        this.container = container;
        this.menu = menu;
        this.step = 1;
        this.email = '';
        this.passwordInput = null;
        this.usernameInput = null;

        this.config = {
            emailTitle: 'Вход QuickFlow',
            pwdTitle: 'Введите пароль',
            emailDescription: 'Введите имя пользователя, которое привязано к вашему аккаунту',
            pwdDescription: (username) => `Введите ваш текущий пароль, привязанный к @${username}`,
            continueBtnText: 'Продолжить',
            signupBtnText: 'Создать аккаунт',
            signinBtnText: 'Войти'
        };

        this.render();
    }

    render() {
        const templateName =
            this.step === 1 ? 'LoginFormComponent.hbs' : 'PasswordFormComponent.hbs';
        const template = Handlebars.templates[templateName]; // Загружаем нужный шаблон

        const html = template({
            emailTitle: this.config.emailTitle,
            emailDescription: this.config.emailDescription,
            pwdTitle: this.config.pwdTitle,
            pwdDescription: this.config.pwdDescription(this.email),
            continueBtnText: this.config.continueBtnText,
            signupBtnText: this.config.signupBtnText,
            signinBtnText: this.config.signinBtnText
        });

        this.container.innerHTML = html;
        this.#attachEvents();
    }

    #attachEvents() {
        if (this.step === 1) {
            this.usernameInput = this.container.querySelector('.username-input');
            const continueBtn = this.container.querySelector('.continue-btn');
            const signupBtn = this.container.querySelector('.signup-btn');

            this.usernameInput.addEventListener('input', () => {
                continueBtn.disabled = !this.usernameInput.value.trim();
            });

            continueBtn.addEventListener('click', (event) => this.continueBtnOnClick(event));

            if (signupBtn) {
                signupBtn.addEventListener('click', () => {
                    window.location.href = '/signup';
                });
            }
        } else {
            this.passwordInput = this.container.querySelector('.password-input');
            const signinBtn = this.container.querySelector('.signin-btn');

            signinBtn.addEventListener('click', (event) => this.signinBtnOnClick(event));
        }
    }

    continueBtnOnClick(event) {
        event.preventDefault();
        this.email = this.usernameInput.value.trim();
        if (!this.email) {
            alert('Введите email!');
            return;
        }
        this.step = 2;
        this.render();
    }

    signinBtnOnClick(event) {
        event.preventDefault();
        const password = this.passwordInput.value.trim();
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
                    alert('Неверный email или пароль');
                }
            }
        });
    }
}
