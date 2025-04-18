import createElement from "@utils/createElement";


export default class ModalWindowComponent {
    protected parent: HTMLElement;
    protected config: Record<string, any>;

    protected wrapper: HTMLElement | null = null;
    protected modalWindow: HTMLElement | null = null;
    protected title: HTMLElement | null = null;
    
    constructor(parent: any, config: any) {
        this.parent = parent;
        this.config = config;
    }

    render() {
        document.body.style.overflow = 'hidden';

        this.wrapper = createElement({
            parent: this.parent,
            classes: ['modal__bg'],
        });

        this.modalWindow = createElement({
            parent: this.wrapper,
            classes: ['modal'],
        });

        const modalTop = createElement({
            parent: this.modalWindow,
            classes: ['modal__top'],
        });

        this.title = createElement({
            parent: modalTop,
            classes: ['modal__title']
        });

        createElement({
            tag: 'button',
            parent: modalTop,
            classes: ['modal__close']
        })
        .addEventListener('click', () => {
            this.close();
        });

        this.addBackgroundClickHandler();
    }

    protected addBackgroundClickHandler() {
        if (!this.wrapper || !this.modalWindow) return;

        this.wrapper.addEventListener('click', (e: MouseEvent) => {
            if (e.target === this.wrapper) {
                this.close();
            }
        });
    }

    close() {
        if (!this.wrapper) return;
        this.wrapper.remove();
        document.body.style.overflow = 'auto';
    }
}
