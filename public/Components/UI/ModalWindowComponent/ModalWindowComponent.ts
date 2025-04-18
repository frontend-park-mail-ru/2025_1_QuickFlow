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

    render() {}

    close() {
        if (!this.wrapper) return;
        this.wrapper.remove();
        document.body.style.overflow = 'auto';
    }
}
