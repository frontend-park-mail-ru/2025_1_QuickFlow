import ModalWindowComponent from '@components/UI/ModalWindowComponent/ModalWindowComponent';
import CreateCommunityFormComponent from '@components/CreateCommunityFormComponent/CreateCommunityFormComponent';


export default class CreateCommunityMwComponent extends ModalWindowComponent {
    constructor(parent: any, config: any) {
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
