import createElement from '@utils/createElement';


const REQUIRED_MARK_TEXT = ' *';


export default class RadioComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    wrapper: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {
        this.wrapper = createElement({
            parent: this.parent,
            classes: ['radio'],
        });

        if (this.config.label) {
            const label = createElement({
                tag: 'label',
                text: this.config.label,
                parent: this.wrapper,
                classes: ['input__label'],
            });

            if (this.config.showRequired === true) {
                createElement({
                    tag: 'span',
                    text: REQUIRED_MARK_TEXT,
                    parent: label,
                    classes: ['input__required'],
                });
            }
        }

        const choicesWrapper = createElement({
            parent: this.wrapper,
            classes: ['radio__choices'],
        });

        for (const key in this.config.radios) {
            const radioData = this.config.radios[key];

            const choice = createElement({
                parent: choicesWrapper,
                classes: ['radio__choice'],
            });

            const input = createElement({
                tag: 'input',
                parent: choice,
                attrs: {
                    type: 'radio',
                    name: this.config.name,
                    value: radioData.value,
                    id: radioData.id,
                },
                classes: ['radio__input'],
            }) as HTMLInputElement;

            choice.addEventListener('click', () => input.checked = true);

            if (this.config.required) {
                input.setAttribute('required', '');
            }

            createElement({
                tag: 'label',
                text: radioData.label,
                parent: choice,
                attrs: {
                    for: radioData.id,
                },
            });
        }
    }

    addListener(listener: any) {
        if (!this.wrapper) return;

        this.wrapper.addEventListener('change', listener);
    }

    isValid() {
        if (!this) return false;

        return this.getChecked() !== null;
    }

    get required() {
        return this.config.required;
    }

    get value() {
        return this.getChecked()?.value.trim();
    }

    get name() {
        return this.config.name?.trim();
    }

    getChecked(): HTMLInputElement | null {
        if (!this.wrapper) return null;
        
        return this.wrapper.querySelector('.radio__input:checked');
    }

    setChecked(value: any) {
        if (!this.wrapper) return;
        const radio = this.wrapper.querySelector(`.radio__input[value="${value}"]`) as HTMLInputElement;
        if (radio) radio.checked = true;
    }
}
