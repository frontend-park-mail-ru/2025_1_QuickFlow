import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import ModalWindowComponent from '@components/UI/ModalWindowComponent/ModalWindowComponent';


export default class DeleteMwComponent extends ModalWindowComponent {
    constructor(parent: HTMLElement, config: Record<string, any>) {
        super(parent, config);
        this.render();
    }

    render() {
        super.render();
        this.renderDeletePostInner();
    }

    renderDeletePostInner() {
        if (!this.modalWindow || !this.title) return;

        this.modalWindow.classList.add('modal_post-delete');
        this.title.textContent = this.config.data.title;

        createElement({
            parent: this.modalWindow,
            text: this.config.data.text,
        });

        const buttons = createElement({
            parent: this.modalWindow,
            classes: ['modal__buttons'],
        });

        new ButtonComponent(buttons, {
            text: this.config.data.cancel,
            variant: 'secondary',
            size: 'small',
            onClick: () => this.close(),
        });

        new ButtonComponent(buttons, {
            text: this.config.data.confirm,
            variant: 'primary',
            size: 'small',
            onClick: () => {
                this.config.delete();
                this.close();
            },
        });
    }
}
