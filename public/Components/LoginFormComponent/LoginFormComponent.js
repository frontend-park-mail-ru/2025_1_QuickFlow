import Ajax from '../../modules/ajax.js';
import InputComponent from '../UI/InputComponent/InputComponent.js';
import ButtonComponent from '../UI/ButtonComponent/ButtonComponent.js';
import createElement from '../../utils/createElement.js';
import focusInput from '../../utils/focusInput.js';

export default class LoginFormComponent {
    #parent
    #menu
    #header
    #focusTimer
    constructor(parent, menu, header) {
        this.#parent = parent;
        this.#menu = menu;
        this.#header = header;
        
        this.step = 1;
        this.passwordInput = null;
        this.usernameInput = null;
        this.continueBtn = null;
        this.#focusTimer = null;

        this.config = {
            usernameTitle: 'Вход QuickFlow',
            pwdTitle: 'Введите пароль',
            usernameDescription: 'Введите имя пользователя, которое привязано к вашему аккаунту',
            pwdDescription: 'Введите ваш текущий пароль,\r\nпривязанный к ',
            continueBtnText: 'Продолжить',
            signupBtnText: 'Создать аккаунт',
            signinBtnText: 'Войти'
        };
        this.render();
    }

    render() {
        this.#parent.innerHTML = '';

        const form = createElement({
            tag: 'form',
            parent: this.#parent,
            classes: ['auth-form']
        });

        this.handleFormSubmission(form);

        if (this.step === 1) {
            this.renderUsernameStep(form);
        } else if (this.step === 2) {
            this.renderPasswordStep(form);
        }
    }

    handleFormSubmission(form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (this.step === 1) {
                this.continueBtnOnClick();
            } else {
                if (this.passwordInput.input.classList.contains('invalid')) return;
                this.signinBtnOnClick(event);
            }
        });
    }

    renderTopWrapper(form) {
        const topWrapper = createElement({
            parent: form,
            classes: ['auth-form-top']
        });

        if (this.step === 2) {
            createElement({
                tag: 'a',
                parent: topWrapper,
                classes: ['auth-form-back-btn']
            })
            .addEventListener('click', () => {
                if (this.step === 1) {
                    localStorage.removeItem("username");
                    this.#menu.goToPage(this.#menu.menuElements.login);
                } else {
                    this.step = 1;
                    this.render();
                }
            });
        }

        createElement({
            parent: topWrapper,
            classes: ['auth-form-logo'],
            attrs: {src: '/static/img/logo-icon.svg'}
        })

        createElement({
            tag: 'h1',
            text: this.step === 1 ? this.config.usernameTitle : this.config.pwdTitle,
            parent: topWrapper,
        })

        createElement({
            tag: 'p',
            classes: ['p1'],
            text: this.step === 1 ? this.config.usernameDescription : `${this.config.pwdDescription}@${this.usernameInput.input.value.trim()}`,
            parent: topWrapper,
        })
    }

    renderBottomWrapper(form) {
        const bottomWrapper = createElement({
            parent: form,
            classes: ['auth-form-bottom'],
        })

        this.continueBtn = new ButtonComponent(bottomWrapper, {
            text: this.step === 1 ? this.config.continueBtnText : this.config.signinBtnText,
            variant: 'primary',
            onClick:
                this.step === 1
                    ? this.continueBtnOnClick.bind(this)
                    : this.signinBtnOnClick.bind(this),
            disabled: this.step === 1,
            stateUpdaters:
                this.step === 1
                ? [this.usernameInput]
                : [this.passwordInput]
        });

        if (this.step === 1) {
            new ButtonComponent(bottomWrapper, {
                text: this.config.signupBtnText,
                variant: 'secondary',
                onClick: () => {
                    this.#menu.goToPage(this.#menu.menuElements.signup);
                }
            });
        }
    }

    renderUsernameStep(form) {
        this.renderTopWrapper(form);

        const fieldsetUsername = createElement({
            tag: 'fieldset',
            parent: form,
            classes: ['login-username'],
        })

        this.usernameInput = new InputComponent(fieldsetUsername, {
            type: 'text',
            placeholder: 'Имя пользователя',
            autocomplete: 'username',
            required: true,
            showRequired: false,
            value: localStorage.getItem("username") || ''
        });
        focusInput(this.usernameInput.input, this.#focusTimer);

        const checkboxWrapper = createElement({
            parent: form,
            classes: ['checkbox-wrapper'],
        })

        createElement({
            tag: 'input',
            parent: checkboxWrapper,
            classes: ['checkbox-wrapper'],
            attrs: {type: 'checkbox', id:'rememberMe'}
        })

        createElement({
            tag: 'label',
            parent: checkboxWrapper,
            attrs: {htmlFor: 'rememberMe'},
            text: 'Запомнить меня'
        })

        this.renderBottomWrapper(form);
    }

    updateBtnState() {
        let disabled;
        if (this.step === 1) {
            disabled = this.usernameInput.input.classList.contains('invalid') || this.usernameInput.input.value === '';
        } else {
            disabled = this.passwordInput.input.classList.contains('invalid') || this.passwordInput.input.value === '';
        }
        this.continueBtn.buttonElement.disabled = disabled;
    }

    renderPasswordStep(form) {
        this.renderTopWrapper(form);

        this.passwordInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Пароль',
            autocomplete: 'password',
            required: true,
            showRequired: false
        });
        focusInput(this.passwordInput.input, this.#focusTimer);

        this.renderBottomWrapper(form);
    }

    continueBtnOnClick() {
        localStorage.setItem("username", this.usernameInput.input.value.trim());
        this.step = 2;
        this.render();
    }

    signinBtnOnClick(event) {
        event.preventDefault();
        const password = this.passwordInput.input.value.trim();
        this.submitLogin(password);
    }

    submitLogin(password) {
        const body = {
            username: this.usernameInput.input.value.trim(),
            password
        };
        Ajax.post({
            url: '/login',
            body,
            callback: (status) => {
                if (status === 200) {
                    this.#menu.username = body.username; // ???
                    this.#menu.goToPage(this.#menu.menuElements.feed);
                    this.#menu.checkAuthPage();
                    this.#menu.updateMenuVisibility(true);
                    this.#header.renderAvatarMenu();
                } else {
                    this.passwordInput.showError('Неверное имя пользователя или пароль');
                    this.passwordInput.addListener(() => {
                        this.passwordInput.hideError();
                        this.updateBtnState();
                    });
                    this.updateBtnState();
                }
            }
        });
    }
}
