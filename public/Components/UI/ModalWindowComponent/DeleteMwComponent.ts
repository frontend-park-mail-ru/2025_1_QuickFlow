import ButtonComponent from '../ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import ModalWindowComponent from '@components/UI/ModalWindowComponent/ModalWindowComponent';


export default class DeleteMwComponent extends ModalWindowComponent {
    constructor(parent: any, config: any) {
        super(parent, config);
        this.render();
    }

    render() {
        super.render();
        this.renderDeletePostInner();
    }

    close() {
        if (!this.wrapper) return;

        this.wrapper.remove();
        document.body.style.overflow = 'auto';
    }

    renderDeletePostInner() {
        if (!this.modalWindow || !this.title) return;

        this.modalWindow.classList.add('modal_post-delete');
        this.title.textContent = 'Вы уверены, что хотите удалить этот пост?';

        createElement({
            parent: this.modalWindow,
            text: 'Пост будет удалён навсегда, это действие нельзя будет отменить',
        });

        const buttons = createElement({
            parent: this.modalWindow,
            classes: ['modal__buttons'],
        });

        new ButtonComponent(buttons, {
            text: 'Отменить',
            variant: 'secondary',
            size: 'small',
            onClick: () => this.close(),
        });

        new ButtonComponent(buttons, {
            text: 'Удалить',
            variant: 'primary',
            size: 'small',
            onClick: () => {
                this.config.ajaxDeletePost();
                this.close();
            },
        });
    }
}
