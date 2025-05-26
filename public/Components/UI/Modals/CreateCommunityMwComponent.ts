import ModalWindowComponent from '@components/UI/Modals/ModalWindowComponent';
import CreateCommunityFormComponent from '@components/Forms/CreateCommunityFormComponent/CreateCommunityFormComponent';


export default class CreateCommunityMwComponent extends ModalWindowComponent {
    constructor(parent: HTMLElement, config: Record<string, any>) {
        super(parent, config);
        this.render();
    }

    render() {
        super.render();
        this.modalWindow.classList.add('modal_inherit');
        this.modalWindow.querySelector('.modal__close').classList.add('modal__close_absolute');
        new CreateCommunityFormComponent(this.modalWindow, {
            closeModal: () => this.close(),
        });
    }
}
