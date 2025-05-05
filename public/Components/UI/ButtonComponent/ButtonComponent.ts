import createElement from '@utils/createElement';


const DEFAULT_TYPE = 'button';
const DEFAULT_TEXT_CONTENT = '';
const DEFAULT_SIZE_CLASS = 'large';
const DEFAULT_CLASSES = ['button'];


export default class ButtonComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    buttonElement: HTMLButtonElement | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;

        this.render();
    }

    render() {
        this.buttonElement = createElement({
            tag: 'button',
            parent: this.parent,
            attrs: { type: this.config.type || DEFAULT_TYPE },
            classes: [
                'button',
                `button_${this.config.variant}`,
                `button_${this.config.size || DEFAULT_SIZE_CLASS}`,
                ...this.config.classes || DEFAULT_CLASSES,
            ],
            text: this.config.text || DEFAULT_TEXT_CONTENT,
        }) as HTMLButtonElement;
        
        if (this.config.icon) {
            this.buttonElement.appendChild(createElement({
                parent: this.parent,
                attrs: { src: this.config.icon },
                classes: ['button__icon'],
            }));
            this.buttonElement.classList.add('button_textless');
        }

        if (this.config.disabled) {
            this.buttonElement.disabled = true;
        }

        if (this.config.onClick && typeof this.config.onClick === 'function') {
            this.buttonElement.addEventListener('click', this.config.onClick);
        }

        if (this.config.stateUpdaters) {
            if (
                Array.isArray(this.config.stateUpdaters) &&
                this.config.stateUpdaters.length > 0
            ) {
                this.config.stateUpdaters.forEach((stateUpdater: any) => {
                    stateUpdater.addListener(() => this.updateBtnState());
                });
            }
            this.updateBtnState()
        }
    }

    disable() {
        this.buttonElement.disabled = true;
    }

    get isDisabled() {
        return this.buttonElement.disabled;
    }

    updateBtnState() {
        if (!this.buttonElement) return;

        let isRequiredValid: boolean;

        switch (this.config.validationType) {
            case "some":
                isRequiredValid = this.config.stateUpdaters.some((stateUpdater: any) => {
                    return stateUpdater.isValid();
                });
                break;
            default:
                isRequiredValid = this.config.stateUpdaters.every((stateUpdater: any) => {
                    return stateUpdater.isValid();
                });
                break;
        }

        this.buttonElement.disabled = !isRequiredValid;

        // const isRequiredValid = this.config.stateUpdaters.every((stateUpdater: any) => {
        //     if (stateUpdater.required) return stateUpdater.isValid();
        //     return true;
        // });

        // const isOptionalFilled = this.config.stateUpdaters.some((stateUpdater: any) => {
        //     if (!stateUpdater.required) return !stateUpdater.isEmpty();
        //     return true;
        // });

        // this.buttonElement.disabled = !(isRequiredValid && isOptionalFilled);
    }
}
