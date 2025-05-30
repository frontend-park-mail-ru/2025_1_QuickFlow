import createElement from "@utils/createElement";


const DEFAULT_PLACEHOLDER = '';
const DEFAULT_TEXT = '';
const DEFAULT_NAME = '';
const DEFAULT_MAX_LENGTH = 256;


interface TextareaConfig {
    placeholder: string;
    maxLength: number;

    name?: string;
    label?: string;
    value?: string;
    classes?: string[];
    textareaClasses?: string[];
    attrs?: Record<string, any>;
    description?: string;
    showCharactersLeft?: boolean;
    required?: boolean;
}


export default class TextareaComponent {
    private parent: HTMLElement;
    private config: TextareaConfig;

    public wrapper: HTMLElement | null = null;
    public textarea: HTMLTextAreaElement | null = null;

    constructor(parent: HTMLElement, config: TextareaConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {
        this.wrapper = createElement({
            parent: this.parent,
            classes: ['textarea'],
        });

        if (this.config.classes) {
            this.config.classes.forEach((className: any) => {
                if (!this.wrapper) return;
                this.wrapper.classList.add(className)
            });
        }

        if (this.config.label) {
            createElement({
                tag: 'label',
                parent: this.wrapper,
                text: this.config.label,
                classes: ['textarea__label'],
            });
        }

        this.textarea = createElement({
            tag: 'textarea',
            parent: this.wrapper,
            classes: ['textarea__field'],
            attrs: {
                placeholder: this.config.placeholder || DEFAULT_PLACEHOLDER,
                name: this.name || DEFAULT_NAME,
                maxlength: this.config.maxLength || DEFAULT_MAX_LENGTH,
            },
            text: this.config.value || DEFAULT_TEXT,
        }) as HTMLTextAreaElement;

        if (this.config.textareaClasses) {
            this.config.textareaClasses.forEach((className: any) => {
                if (!this.textarea) return;
                this.textarea.classList.add(className)
            });
        }

        for (const attr in this.config.attrs) {
            this.textarea.setAttribute(attr, this.config.attrs[attr]);
        }

        if (this.required) {
            this.textarea.setAttribute("required", "");
        }

        if (
            this.config.description ||
            (this.config.maxLength && this.config.showCharactersLeft)
        ) {
            const descWrapper = createElement({
                parent: this.wrapper,
                classes: ['textarea__description-wrapper'],
            });

            if (this.config.description) {
                createElement({
                    tag: 'span',
                    text: this.config.description,
                    parent: descWrapper,
                    classes: ['input__description'],
                });
            }

            if (this.config.showCharactersLeft) {
                const counter = createElement({
                    tag: 'span',
                    text: (this.config.maxLength - this.textarea.value.length).toString(),
                    parent: descWrapper,
                    classes: ['input__counter'],
                });

                this.textarea.addEventListener('input', () => {
                    if (!this.textarea) return;
                    counter.textContent = (this.config.maxLength - this.textarea.value.length).toString();
                });
            }
        }
    }

    addListener(listener: any) {
        if (!this.textarea) return;
        
        this.textarea.addEventListener('input', listener);
    }

    get value() {
        if (!this.textarea) return;

        return this.textarea.value.trim();
    }

    get name() {
        return this.config.name?.trim();
    }

    isValid() {
        if (!this.textarea) return false;
        if (!this.required) return true;
        return this.textarea.value.trim() !== '';
    }

    isEmpty() {
        if (!this.textarea) return;
        return this.textarea.value.trim() === '';
    }

    get required() {
        return this.config.required;
    }
}
