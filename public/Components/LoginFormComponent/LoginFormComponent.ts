import Ajax from '@modules/ajax';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import focusInput from '@utils/focusInput';
import router from '@router';
import { setLsItem, getLsItem, removeLsItem } from '@utils/localStorage';
import { UsersRequests } from '@modules/api';
import LsProfile from '@modules/LsProfile';


export default class LoginFormComponent {
    private parent: HTMLElement;
    private focusTimer: any = null;
    config: Record<string, string> = {
        usernameTitle: 'Вход в аккаунт',
        pwdTitle: 'Введите пароль',
        usernameDescription: 'Введите имя пользователя, которое привязано к вашему аккаунту',
        pwdDescription: 'Введите ваш текущий пароль,\r\nпривязанный к ',
        continueBtnText: 'Продолжить',
        signupBtnText: 'Создать аккаунт',
        signinBtnText: 'Войти'
    };
    step: number = 1;
    passwordInput: InputComponent | null = null;
    usernameInput: InputComponent | null = null;
    continueBtn: ButtonComponent | null = null;
    form: HTMLFormElement | null = null;

    constructor(parent: HTMLElement) {
        this.parent = parent;
        this.render();
    }

    render() {
        if (this.form) this.form.remove();

        this.form = createElement({
            tag: 'form',
            parent: this.parent,
            classes: ['auth-form']
        }) as HTMLFormElement;

        switch (this.step) {
            case 1:
                this.renderUsernameStep(this.form);
                break;
            case 2:
                this.renderPasswordStep(this.form);
                break;
        }

        this.handleFormSubmission(this.form);
    }

    handleFormSubmission(form: HTMLFormElement) {
        form.addEventListener('submit', (event: any) => {
            event.preventDefault();
            if (this.continueBtn.isDisabled) return;
            if (this.step === 1) return this.continueBtnOnClick();
            if (this.passwordInput?.input?.classList.contains('invalid')) return;
            this.signinBtnOnClick(event);
        });
    }

    renderTopWrapper(form: HTMLFormElement) {
        const topWrapper = createElement({
            parent: form,
            classes: ['auth-form__top']
        });

        if (this.step === 2) {
            createElement({
                tag: 'a',
                parent: topWrapper,
                classes: ['auth-form__back-btn']
            })
            .addEventListener('click', () => {
                if (this.step === 1) {
                    removeLsItem("username");
                    router.go({ path: '/login' });
                } else {
                    this.step = 1;
                    this.render();
                }
            });
        }

        // createElement({
        //     parent: topWrapper,
        //     classes: ['auth-form__logo'],
        //     attrs: {src: '/static/img/logo-icon.svg'}
        // })

        createElement({
            tag: 'h1',
            text: this.step === 1 ? this.config.usernameTitle : this.config.pwdTitle,
            parent: topWrapper,
        })

        createElement({
            tag: 'p',
            classes: ['p1'],
            text: this.step === 1 ?
                this.config.usernameDescription :
                `${this.config.pwdDescription}@${this.usernameInput?.input?.value.trim()}`,
            parent: topWrapper,
        })
    }

    renderBottomWrapper(form: HTMLFormElement) {
        const bottomWrapper = createElement({
            parent: form,
            classes: ['auth-form__bottom'],
        })

        this.continueBtn = new ButtonComponent(bottomWrapper, {
            text: this.step === 1 ? this.config.continueBtnText : this.config.signinBtnText,
            type: "submit",
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
                onClick: () => router.go({ path: '/signup' }),
            });
        }
    }

    renderUsernameStep(form: HTMLFormElement) {
        this.renderTopWrapper(form);

        const fieldsetUsername = createElement({
            tag: 'fieldset',
            parent: form,
            classes: ['auth-form__username'],
        })

        this.usernameInput = new InputComponent(fieldsetUsername, {
            type: 'text',
            placeholder: 'Никнейм',
            autocomplete: 'username',
            required: true,
            showRequired: false,
            value: getLsItem("username", ""),
        });
        if (this.usernameInput.input) focusInput(this.usernameInput.input, this.focusTimer);

        // const checkboxWrapper = createElement({
        //     parent: form,
        //     classes: ['auth-form__checkboxes'],
        // })

        // createElement({
        //     tag: 'input',
        //     parent: checkboxWrapper,
        //     classes: ['auth-form__checkbox'],
        //     attrs: {type: 'checkbox', id:'rememberMe'}
        // })

        // createElement({
        //     tag: 'label',
        //     parent: checkboxWrapper,
        //     attrs: {htmlFor: 'rememberMe'},
        //     text: 'Запомнить меня'
        // })

        this.renderBottomWrapper(form);
    }

    updateBtnState() {
        let disabled;
        if (this.step === 1) {
            disabled = this.usernameInput?.input?.classList.contains('invalid') || this.usernameInput?.input?.value === '';
        } else {
            disabled = this.passwordInput?.input?.classList.contains('invalid') || this.passwordInput?.input?.value === '';
        }
        if (this.continueBtn?.buttonElement) this.continueBtn.buttonElement.disabled = disabled;
    }

    renderPasswordStep(form: HTMLFormElement) {
        this.renderTopWrapper(form);

        this.passwordInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Пароль',
            autocomplete: 'password',
            required: true,
            showRequired: false
        });
        if (this.passwordInput.input) focusInput(this.passwordInput.input, this.focusTimer);

        this.renderBottomWrapper(form);
    }

    continueBtnOnClick() {
        if (!this.usernameInput?.input?.value.trim()) return;
        setLsItem("username", this.usernameInput.value),
        this.step = 2;
        this.render();
    }

    signinBtnOnClick(event: any) {
        event.preventDefault();
        if (!this.passwordInput?.input?.value.trim()) return;
        const password = this.passwordInput.input.value.trim();
        this.submitLogin(password);
    }

    submitLogin(password: any) {
        this.continueBtn.disable();

        const body = {
            username: this.usernameInput?.input?.value.trim(),
            password
        };
        Ajax.post({
            url: '/login',
            body,
            callback: async (status: number) => {
                if (status === 200) {
                    await LsProfile.update();

                    document.cookie = `username=${encodeURIComponent(LsProfile.username)}; path=/`;
                    router?.menu?.renderProfileMenuItem();
                    router?.menu?.renderProfileMenuItem();
                    setLsItem('is-general-feedback-ready', 'true');

                    // (async () => {
                    //     const [status, data] = await UsersRequests.getMyProfile();
                    //     // const [status, data] = await UsersRequests.getProfile(getLsItem('username', null));
                    //     if (status === 200) setLsItem('user_id', data.id);
                    // })();

                    router.go({ path: '/feed' });
                    return;
                }
                this.passwordInput?.showError('Неверное имя пользователя или пароль');
                this.passwordInput?.addListener(() => {
                    this.passwordInput?.hideError();
                    this.updateBtnState();
                });
                this.updateBtnState();
            }
        });
    }
}
