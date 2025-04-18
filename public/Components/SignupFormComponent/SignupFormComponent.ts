import Ajax from '@modules/ajax';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import RadioComponent from '@components/UI/RadioComponent/RadioComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import focusInput from '@utils/focusInput';
import convertDate from '@utils/convertDate';
import { getLsItem, removeLsItem, setLsItem } from '@utils/localStorage';
import router from '@router';


const DEFAULT_INPUT_VALUE = '';
const CREATION_ERROR_MESSAGE = 'Не удалось создать аккаунт';
const USER_INFO_TITLE = 'Информация о себе';
const PWD_TITLE = 'Придумайте пароль';
const PWD_TEXT = 'Или используйте пароль,\nпредложенный устройством';
const CONTINUE_BTN_TEXT = 'Продолжить';
const PWD_INPUT_MAX_LENGTH = 32;
const MALE_VALUE = 1;
const FEMALE_VALUE = 2;


export default class SignupFormComponent {
    private parent: HTMLElement;
    private step: number = 1;
    private focusTimer: any = null;
    private form: HTMLFormElement;

    usernameInput: InputComponent | null = null;
    firstnameInput: InputComponent | null = null;
    lastnameInput: InputComponent | null = null;
    birthDateInput: InputComponent | null = null;
    passwordInput: InputComponent | null = null;
    passwordConfirmationInput: InputComponent | null = null;
    sexInput: RadioComponent | null = null;
    continueBtn: ButtonComponent | null = null;

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
                this.renderPersonalInfoStep(this.form);
                break;
            case 2:
                this.renderCreatePasswordStep(this.form);
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
            this.signupBtnOnClick(event);
        });
    }

    renderTopWrapper(form: HTMLFormElement) {
        const topWrapper = createElement({
            parent: form,
            classes: ['auth-form__top']
        });

        createElement({
            tag: 'a',
            parent: topWrapper,
            classes: ['auth-form__back-btn']
        })
        .addEventListener('click', () => {
            if (this.step === 1) {
                removeLsItem(this.usernameInput?.name);
                removeLsItem(this.firstnameInput?.name);
                removeLsItem(this.lastnameInput?.name);
                removeLsItem(this.sexInput?.name);
                removeLsItem(this.birthDateInput?.name);
                router.go({ path: '/login' });
                return;
            }
            this.step = 1;
            this.render();
        });

        // if (this.step === 2) {
        //     createElement({
        //         parent: topWrapper,
        //         classes: ['auth-form__logo'],
        //         attrs: {src: LOGO_SRC}
        //     })
        // }

        createElement({
            tag: 'h1',
            parent: topWrapper,
            text: this.step === 1 ? USER_INFO_TITLE : PWD_TITLE
        })

        if (this.step === 2) {
            createElement({
                tag: 'p',
                parent: topWrapper,
                classes: ['p1', 'auth-form__description'],
                text: PWD_TEXT,
            })
        }
    }

    renderBottomWrapper(form: HTMLFormElement) {
        const bottomWrapper = createElement({
            parent: form,
            classes: ['auth-form__bottom'],
        })

        this.continueBtn = new ButtonComponent(bottomWrapper, {
            text: CONTINUE_BTN_TEXT,
            type: "submit",
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

    renderPersonalInfoStep(form: HTMLFormElement) {
        this.renderTopWrapper(form);

        const fieldsetPersonalInfo = createElement({
            tag: 'fieldset',
            parent: form,
            classes: ['auth-form__personal-info'],
        })

        this.usernameInput = new InputComponent(fieldsetPersonalInfo, {
            type: 'text',
            name: 'username',
            label: 'Имя пользователя',
            placeholder: 'Имя пользователя',
            autocomplete: 'username',
            maxLength: 20,
            validation: 'username',
            required: true,
            showRequired: false,
            value: getLsItem("username", DEFAULT_INPUT_VALUE),
        });
        if (this.usernameInput.input) focusInput(this.usernameInput.input, this.focusTimer);

        const nameInputWrapper = createElement({
            parent: fieldsetPersonalInfo,
            classes: ['auth-form__name-inputs'],
        })

        this.firstnameInput = new InputComponent(nameInputWrapper, {
            type: 'text',
            label: 'Имя',
            name: 'firstname',
            placeholder: 'Имя',
            maxLength: 25,
            validation: 'name',
            required: true,
            showRequired: false,
            value: getLsItem("firstname", DEFAULT_INPUT_VALUE),
        });

        this.lastnameInput = new InputComponent(nameInputWrapper, {
            type: 'text',
            label: 'Фамилия',
            name: 'lastname',
            placeholder: 'Фамилия',
            maxLength: 25,
            validation: 'name',
            required: true,
            showRequired: false,
            value: getLsItem("lastname", DEFAULT_INPUT_VALUE),
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
        this.sexInput.setChecked(getLsItem("sex", ""));

        this.birthDateInput = new InputComponent(fieldsetPersonalInfo, {
            type: 'text',
            label: 'Дата рождения',
            name: 'birthDate',
            placeholder: 'дд.мм.гггг',
            autocomplete: 'date',
            validation: 'date',
            required: true,
            showRequired: false,
            value: getLsItem("birthDate", DEFAULT_INPUT_VALUE),
        });

        this.renderBottomWrapper(form);
    }

    renderCreatePasswordStep(form: HTMLFormElement) {
        this.renderTopWrapper(form);

        this.passwordInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Введите пароль',
            maxLength: PWD_INPUT_MAX_LENGTH,
            validation: 'password',
            required: true,
            showRequired: false
        });
        if (this.passwordInput.input) focusInput(this.passwordInput.input, this.focusTimer);

        this.passwordConfirmationInput = new InputComponent(form, {
            type: 'password',
            placeholder: 'Повторите пароль',
            maxLength: PWD_INPUT_MAX_LENGTH,
            validation: 'password',
            required: true,
            showRequired: false
        });

        this.passwordConfirmationInput.addListener(() => {
            this.passwordInput?.addListener(() => this.validatePasswordConfirmation());
            this.validatePasswordConfirmation();
        });

        this.renderBottomWrapper(form);
    }

    validatePasswordConfirmation() {
        const password = this.passwordInput?.value;
        const confirmPassword = this.passwordConfirmationInput?.value;

        if (password !== confirmPassword) {
            this.passwordConfirmationInput?.showError('Пароли не совпадают');
            return false;
        }

        this.passwordConfirmationInput?.hideError();
        return true;
    }

    continueBtnOnClick() {
        setLsItem(this.usernameInput?.name, this.usernameInput?.value ?? '');
        setLsItem(this.firstnameInput?.name, this.firstnameInput?.value ?? '');
        setLsItem(this.lastnameInput?.name, this.lastnameInput?.value ?? '');
        setLsItem(this.sexInput?.name, this.sexInput?.value ?? '');
        setLsItem(this.birthDateInput?.name, this.birthDateInput?.value ?? '');
        this.step = 2;
        this.render();
    }

    signupBtnOnClick(event: any) {
        event.preventDefault();
        this.submitSignup();
    }

    submitSignup() {
        this.continueBtn.disable();
        
        Ajax.post({
            url: '/signup',
            body: {
                username: this.usernameInput?.value,
                password: this.passwordInput?.value,
                firstname: this.firstnameInput?.value,
                lastname: this.lastnameInput?.value,
                sex: this.sexInput?.value === 'male' ? MALE_VALUE : FEMALE_VALUE, 
                birth_date: convertDate(this.birthDateInput?.value ?? '', 'ts'),
            },
            callback: (status: number) => {
                if (status === 200) {
                    router.menu.renderProfileMenuItem();
                    router.go({ path: '/feed' });
                    return;
                }
                this.passwordInput?.showError(CREATION_ERROR_MESSAGE);
            }
        });
    }
}
