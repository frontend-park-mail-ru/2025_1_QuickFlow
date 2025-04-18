import createElement from '@utils/createElement';
import convertDate from '@utils/convertDate';
import { profileDataLayout } from '@views/ProfileView/ProfileView';
import ModalWindowComponent from '@components/UI/ModalWindowComponent/ModalWindowComponent';


export default class ProfileInfoMwComponent extends ModalWindowComponent {
    constructor(parent: any, config: any) {
        super(parent, config);
        this.render();
    }

    render() {
        super.render();
        this.renderProfileInfoInner();
    }

    close() {
        if (!this.wrapper) return;

        this.wrapper.remove();
        document.body.style.overflow = 'auto';
    }

    renderProfileInfoInner() {
        if (!this.modalWindow || !this.title) return;

        this.modalWindow.classList.add('modal_profile');
        this.title.textContent = 'Подробная информация';

        const contentWrapper = createElement({
            parent: this.modalWindow,
            classes: ['modal__content'],
        });

        const items = createElement({
            parent: contentWrapper,
            classes: ['modal__items'],
        });

        this.config.createInfoItem(
            items,
            profileDataLayout['username'].icon,
            this.config.data.profile.username,
        );
        this.config.createInfoItem(
            items,
            profileDataLayout['birth_date'].icon,
            convertDate(this.config.data.profile.birth_date),
        );
        if (this.config.data.profile.bio) {
            this.config.createInfoItem(
                items,
                profileDataLayout['bio'].icon,
                this.config.data.profile.bio,
            );    
        }
        
        if (Object.keys(this.config.data.contact_info).length > 0) {
            this.renderProfileInfoBlock(items, this.config.data.contact_info);
        }

        if (Object.keys(this.config.data.school).length > 0) {
            this.renderProfileInfoBlock(items, this.config.data.school);
        }
        
        if (Object.keys(this.config.data.university).length > 0) {
            this.renderProfileInfoBlock(items, this.config.data.university);
        }

        // const countedItems = createElement({
        //     parent: contentWrapper,
        //     classes: ['modal-items-counted'],
        // });

        // for (const key in this.config.data.countedData) {
        //     const value = this.config.data.countedData[key];
        //     this.config.createCountedItem(countedItems, profileDataLayout[key].text, value);
        // }
    }

    renderProfileInfoBlock(parent: HTMLElement, blockData: any, showDivider = true) {
        if (showDivider) {
            createElement({
                parent,
                classes: ['modal__divider'],
            });
        }
        for (const key in blockData) {
            const value = blockData[key];
            this.config.createInfoItem(parent, profileDataLayout[key].icon, value);
        }
    }
}
