import createElement from '@utils/createElement';
import convertDate from '@utils/convertDate';
import { INFO_ITEMS_LAYOUT } from '@views/ProfileView/ProfileActionsConfig';
import ModalWindowComponent from '@components/UI/ModalWindowComponent/ModalWindowComponent';
import API from '@utils/api';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';


const COMMUNITY_INFO_ITEMS_LAYOUT = {
    nickname: {icon: 'at'},
    link: {icon: 'globe'},
    description: {icon: 'align-left-text'},
    created_at: {icon: 'gift'},




    bio: {icon: 'profile-primary'},

    city: {icon: 'location'},
    email: {icon: 'envelope'},
    phone: {icon: 'phone'},

    school_city: {icon: "location"},
    school_name: {icon: "diploma"},

    univ_city: {icon: "location"},
    univ_name: {icon: "diploma"},
    faculty: {icon: "diploma"},
    grad_year: {icon: "diploma"},

    // friends: {text: 'друзей'},
    // subscribers: {text: 'подписчиков'},
    // subscribes: {text: 'подписок'},

    // more: {
    //     icon: 'info',
    //     text: 'Подробнее',
    // }
};


export default class ProfileInfoMwComponent extends ModalWindowComponent {
    constructor(parent: any, config: any) {
        super(parent, config);
        this.render();
    }

    render() {
        super.render();
        this.renderProfileInfoInner();
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

        switch (this.config.type) {
            case 'community':
                this.renderCommunity(items);
                break;
            default:
                this.renderProfile(items);
                break;
        }
    }

    private renderCommunity(items: HTMLElement) {
        const data = this.config.data.payload;

        this.config.createInfoItem(
            items,
            COMMUNITY_INFO_ITEMS_LAYOUT['nickname'].icon,
            data.community.nickname,
        );

        // this.config.createInfoItem(
        //     items,
        //     INFO_ITEMS_LAYOUT['globe'].icon,
        //     `https://www.quickflowapp.ru/communities/${data.nickname}`,
        // );

        if (data.community.description) {
            this.config.createInfoItem(
                items,
                COMMUNITY_INFO_ITEMS_LAYOUT['description'].icon,
                data.community.description,
            );    
        }

        this.config.createInfoItem(
            items,
            COMMUNITY_INFO_ITEMS_LAYOUT['created_at'].icon,
            'Сообщество создано ' + convertDate(data.created_at.slice(0, 10)),
        );
        
        this.renderContactsInfoBlock(items);
    }

    private renderContactsInfoBlock(parent: HTMLElement) {
        const owner = this.config.data.payload.owner;

        createElement({
            parent,
            classes: ['modal__divider'],
        });

        createElement({
            parent,
            classes: ['modal__title'],
            text: 'Контакты',
        });

        const contact = createElement({
            tag: 'a',
            parent,
            classes: ['modal__contact'],
            attrs: { href: `/profiles/${owner.username}` },
        });
        new AvatarComponent(contact, {
            src: owner?.avatar_url,
            size: 's',
        })
        const contactInfo = createElement({
            parent: contact,
            classes: ['modal__contact-info'],
        });
        createElement({
            tag: 'h3',
            parent: contactInfo,
            text: `${owner?.firstname} ${owner?.lastname}`,
        });
        createElement({
            parent: contactInfo,
            classes: ['modal__contact-description'],
            text: 'Владелец',
        });
    }

    private renderProfile(items: HTMLElement) {
        this.config.createInfoItem(
            items,
            INFO_ITEMS_LAYOUT['username'].icon,
            this.config.data.profile.username,
        );
        this.config.createInfoItem(
            items,
            INFO_ITEMS_LAYOUT['birth_date'].icon,
            convertDate(this.config.data.profile.birth_date),
        );
        if (this.config.data.profile.bio) {
            this.config.createInfoItem(
                items,
                INFO_ITEMS_LAYOUT['bio'].icon,
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
        //     this.config.createCountedItem(countedItems, INFO_ITEMS_LAYOUT[key].text, value);
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
            this.config.createInfoItem(parent, INFO_ITEMS_LAYOUT[key].icon, value);
        }
    }
}
