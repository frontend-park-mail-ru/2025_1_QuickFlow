import InputComponent from '@components/UI/InputComponent/InputComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import focusInput from '@utils/focusInput';
import router from '@router';
import { setLsItem, getLsItem } from '@utils/localStorage';
import API from '@utils/api';


export default class CreateCommunityFormComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    private focusTimer: any = null;
    private staticConfig: Record<string, string> = {
        nameTitle: 'Придумайте название',
        addressTitle: 'Выберите адрес',
        nameDescription: 'Используйте слова, которые передают идею сообщества. Выбранное название можно изменить позже.',
        addressDescription: 'Адрес будет использоваться в ссылках на ваше собщество. Выбранный адрес можно изменить позже.',
        continueBtnText: 'Продолжить',
        submitBtnText: 'Создать сообщество'
    };
    private step: number = 1;
    private addressInput: InputComponent | null = null;
    private nameInput: InputComponent | null = null;
    private submitBtn: ButtonComponent | null = null;
    private form: HTMLFormElement | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        if (this.form) this.form.remove();

        this.form = createElement({
            tag: 'form',
            parent: this.parent,
            classes: ['auth-form']
        }) as HTMLFormElement;

        switch (this.step) {
            case 1:
                this.renderNameStep(this.form);
                break;
            case 2:
                this.renderAddressStep(this.form);
                break;
        }

        this.handleFormSubmission(this.form);
    }

    private handleFormSubmission(form: HTMLFormElement) {
        form.addEventListener('submit', (event: any) => {
            event.preventDefault();
            if (this.submitBtn.isDisabled) return;
            if (this.step === 1) return this.continueBtnOnClick();
            if (this.addressInput?.input?.classList.contains('invalid')) return;
            this.submitBtnOnClick(event);
        });
    }

    private renderTopWrapper(form: HTMLFormElement) {
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
                if (this.step === 2) {
                    this.step = 1;
                    this.render();
                }
            });
        }

        createElement({
            tag: 'h1',
            text: this.step === 1 ? this.staticConfig.nameTitle : this.staticConfig.addressTitle,
            parent: topWrapper,
        })

        createElement({
            tag: 'p',
            classes: ['p1'],
            text: this.step === 1 ?
                this.staticConfig.nameDescription :
                this.staticConfig.addressDescription,
            parent: topWrapper,
        })
    }

    private renderBottomWrapper(form: HTMLFormElement) {
        const bottomWrapper = createElement({
            parent: form,
            classes: ['auth-form__bottom'],
        })

        this.submitBtn = new ButtonComponent(bottomWrapper, {
            text: this.step === 1 ? this.staticConfig.continueBtnText : this.staticConfig.submitBtnText,
            type: "submit",
            variant: 'primary',
            onClick:
                this.step === 1
                    ? this.continueBtnOnClick.bind(this)
                    : this.submitBtnOnClick.bind(this),
            disabled: this.step === 1,
            stateUpdaters:
                this.step === 1
                ? [this.nameInput]
                : [this.addressInput]
        });
    }

    private renderNameStep(form: HTMLFormElement) {
        this.renderTopWrapper(form);

        const fieldsetUsername = createElement({
            tag: 'fieldset',
            parent: form,
            classes: ['auth-form__username'],
        })

        this.nameInput = new InputComponent(fieldsetUsername, {
            type: 'text',
            placeholder: 'Введите название',
            required: true,
            showRequired: false,
            value: getLsItem("new-community-name", ""),
        });
        if (this.nameInput.input) focusInput(this.nameInput.input, this.focusTimer);

        this.renderBottomWrapper(form);
    }

    private updateBtnState() {
        let disabled;
        if (this.step === 1) {
            disabled = this.nameInput?.input?.classList.contains('invalid') || this.nameInput?.input?.value === '';
        } else {
            disabled = this.addressInput?.input?.classList.contains('invalid') || this.addressInput?.input?.value === '';
        }
        if (this.submitBtn?.buttonElement) this.submitBtn.buttonElement.disabled = disabled;
    }

    private renderAddressStep(form: HTMLFormElement) {
        this.renderTopWrapper(form);

        this.addressInput = new InputComponent(form, {
            type: 'username',
            placeholder: 'Введите адрес',
            label: 'https://quickflowapp.ru/communities/',
            required: true,
            showRequired: false,
            validation: 'username',
            entity: 'Адрес',
        });
        if (this.addressInput.input) focusInput(this.addressInput.input, this.focusTimer);

        this.renderBottomWrapper(form);
    }

    private continueBtnOnClick() {
        if (!this.nameInput?.input?.value.trim()) return;
        setLsItem("new-community-name", this.nameInput.value),
        this.step = 2;
        this.render();
    }

    private submitBtnOnClick(event: any) {
        event.preventDefault();
        if (!this.addressInput?.input?.value.trim()) return;
        // const password = this.addressInput.input.value.trim();
        this.submit();
    }

    private async submit() {
        this.submitBtn.disable();

        const [status, communityData] = await API.createCommunity(
            this.addressInput?.input?.value?.trim(),
            this.nameInput?.input?.value?.trim()
        );

        switch (status) {
            case 200:
                this.config.closeModal();
                router.go({ path: `/communities/${communityData.payload.community.nickname}` });
                break;
            default:
                this.nameInput.showError('Не удалось создать сообщество');
                this.nameInput.addListener(() => {
                    this.nameInput.hideError();
                    this.updateBtnState();
                });
                break;
        }
    }
}
