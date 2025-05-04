import InputComponent from '@components/UI/InputComponent/InputComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import focusInput from '@utils/focusInput';
import router from '@router';
import { setLsItem, getLsItem, removeLsItem } from '@utils/localStorage';
import API from '@utils/api';


export default class CreateCommunityFormComponent {
    private parent: HTMLElement;
    private focusTimer: any = null;
    private nameInput: InputComponent | null = null;
    private submitBtn: ButtonComponent | null = null;
    private form: HTMLFormElement | null = null;

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

        this.renderUsernameStep(this.form);
        this.handleFormSubmission(this.form);
    }

    handleFormSubmission(form: HTMLFormElement) {
        form.addEventListener('submit', (event: any) => {
            event.preventDefault();
            if (this.submitBtn.isDisabled) return;
            if (this.nameInput?.input?.classList.contains('invalid')) return;
            this.submitBtnOnClick(event);
        });
    }

    renderTopWrapper(form: HTMLFormElement) {
        const topWrapper = createElement({
            parent: form,
            classes: ['auth-form__top']
        });

        createElement({
            tag: 'h1',
            text: 'Придумайте название',
            parent: topWrapper,
        })

        createElement({
            tag: 'p',
            classes: ['p1'],
            text: 'Используйте слова, которые передают идею сообщества. Выбранное название можно изменить позже.',
            parent: topWrapper,
        })
    }

    renderBottomWrapper(form: HTMLFormElement) {
        this.submitBtn = new ButtonComponent(form, {
            text: 'Создать сообщество',
            type: "submit",
            variant: 'primary',
            onClick: this.submitBtnOnClick.bind(this),
            disabled: true,
            stateUpdaters: [this.nameInput],
        });
    }

    renderUsernameStep(form: HTMLFormElement) {
        this.renderTopWrapper(form);

        this.nameInput = new InputComponent(form, {
            type: 'text',
            placeholder: 'Введите название',
            required: true,
            showRequired: false,
        });
        if (this.nameInput.input) focusInput(this.nameInput.input, this.focusTimer);

        this.renderBottomWrapper(form);
    }

    updateBtnState() {
        this.submitBtn.buttonElement.disabled = 
            this.nameInput?.input?.classList.contains('invalid') ||
            this.nameInput?.input?.value === '';
    }

    submitBtnOnClick(event: any) {
        event.preventDefault();
        const name = this.nameInput?.input?.value?.trim();
        if (!name) return;
        this.submit(name);
    }

    async submit(name: any) {
        this.submitBtn.disable();

        const [status, communityData] = await API.createCommunity(name);
        switch (status) {
            case 200:
                router.go({ path: `/communities/${communityData.id}` });
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
