import ButtonComponent from '../ButtonComponent/ButtonComponent';
import TextareaComponent from '@components/UI/TextareaComponent/TextareaComponent';
import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';
import Ajax from '@modules/ajax';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';
import ModalWindowComponent from '@components/UI/ModalWindowComponent/ModalWindowComponent';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import CreateCommunityFormComponent from '@components/CreateCommunityFormComponent/CreateCommunityFormComponent';


const POST_TEXT_MAX_LENGTH = 4000;
const PICS_MAX_COUNT = 10;
const PIC_MAX_RESOLUTION = 1680;


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
