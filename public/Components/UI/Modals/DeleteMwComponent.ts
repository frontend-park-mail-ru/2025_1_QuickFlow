import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import ModalWindowComponent from '@components/UI/Modals/ModalWindowComponent';


export interface DeleteMwConfig {
    data: {
        title: string;
        text: string;
        cancel: string;
        confirm: string;
    };
    delete: () => void;
    cancel?: () => void;
}


export default class DeleteMwComponent extends ModalWindowComponent {
    protected config: DeleteMwConfig;

    constructor(parent: HTMLElement, config: DeleteMwConfig) {
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
            onClick: () => {
                this.close();
                this.config?.cancel();
            }
        });

        new ButtonComponent(buttons, {
            text: this.config.data.confirm,
            variant: 'critical',
            size: 'small',
            onClick: () => {
                this.config.delete();
                this.close();
            },
        });
    }
}
