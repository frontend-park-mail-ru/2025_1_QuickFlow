import ButtonComponent from '../ButtonComponent/ButtonComponent.js';
import TextareaComponent from '../TextareaComponent/TextareaComponent.js';
import createElement from '../../../utils/createElement.js';
import convertDate from '../../../utils/convertDate.js';
import { profileDataLayout } from '../../../Views/ProfileView/ProfileView.js'
import Ajax from '../../../modules/ajax.js';
import FileInputComponent from '../FileInputComponent/FileInputComponent.js';


const POST_TEXT_MAX_LENGTH = 1000;


export default class ModalWindowComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.wrapper = null;
        this.modalWindow = null;
        this.title = null;
        this.fileInput = [];
        this.render();
    }

    render() {
        document.body.style.overflow = 'hidden';

        this.wrapper = createElement({
            parent: this.#parent,
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

        switch (this.#config.type) {
            case 'create-post':
                this.renderPostInner();
                break;
            case 'edit-post':
                this.renderPostInner(true);
                break;
            case 'delete-post':
                this.renderDeletePostInner();
                break;
            case 'profile-full-info':
                this.renderProfileInfoInner();
                break;
        }
    }

    close() {
        this.wrapper.remove();
        document.body.style.overflow = 'auto';
    }

    renderDeletePostInner() {
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
                this.#config.ajaxDeletePost();
                this.close();
            },
        });
    }

    renderPostInner(isFilled = false) {
        this.modalWindow.classList.add('modal_post');
        this.title.textContent = isFilled ? 'Редактирование поста' : 'Новый пост';

        const hasPics = (
            isFilled &&
            this.#config?.data?.pics &&
            this.#config?.data?.pics.length > 0
        )

        const picsWrapper = createElement({
            parent: this.modalWindow,
            classes: [
                'modal__pics',
                hasPics ? 'modal__pics' : 'modal__pics_blank',
            ],
        });
        const addPicWrapper = createElement({
            parent: picsWrapper,
            classes: ['modal__add-pic'],
        });
        createElement({
            parent: addPicWrapper,
            classes: ['modal__camera'],
            attrs: {src: '/static/img/camera-dark-icon.svg'},
        });
        createElement({
            tag: 'h4',
            parent: addPicWrapper,
            text: 'Добавьте фото',
        });

        const fileInputConfig = {
            imitator: addPicWrapper,
            preview: this.createPicWrapperTemplate(),
            id: 'post-pic-upload',
            onUpload: () => this.handlePicUpload(picsWrapper),
            multiple: true,
        };
        
        if (hasPics) fileInputConfig.preloaded = this.#config.data.pics;

        this.fileInput = new FileInputComponent(picsWrapper, fileInputConfig);

        const textarea = new TextareaComponent(this.modalWindow, {
            placeholder: 'Поделитесь своими мыслями',
            value: this.#config?.data?.text || '',
            showCharactersLeft: true,
            maxLength: POST_TEXT_MAX_LENGTH,
        });

        new ButtonComponent(this.modalWindow, {
            text: isFilled ? 'Сохранить' : 'Опубликовать',
            variant: 'primary',
            size: 'small',
            onClick: () => this.handlePostSubmit(textarea.textarea.value.trim()),
            disabled: true,
            stateUpdaters: [textarea, this.fileInput]
        });
    }

    createPicWrapperTemplate() {
        const picWrapperTemplate = createElement({
            classes: ['modal__pic'],
        });
        createElement({
            tag: 'img',
            parent: picWrapperTemplate,
            classes: ['modal__img'],
        });
        return picWrapperTemplate;
    }

    handlePicUpload(picsWrapper) {
        picsWrapper.classList.remove('modal__pics_blank');
    }

    async handlePostSubmit(text) {
        if (!text && !this.fileInput.input.files.length) return;

        const formData = new FormData();
        formData.append('text', text);

        if (this.fileInput.input.files.length > 0) {
            for (const file of this.fileInput.input.files) {
                formData.append('pics', file);
            }
        }

        if (this.#config.type === 'create-post') {
            Ajax.post({
                url: '/post',
                body: formData,
                isFormData: true,
                callback: (status, config) => {
                    if (status === 200) {
                        this.#config.renderCreatedPost(config?.payload);
                        this.close();
                    } else if (status === 413) {
                        alert('File is too large');
                    }
                }
            });
        } else if (this.#config.type === 'edit-post') {
            Ajax.put({
                url: `/posts/${this.#config.data.id}`,
                body: formData,
                isFormData: true,
                callback: (status) => {
                    if (status === 200) {
                        this.close();
                    } else if (status === 413) {
                        alert('File is too large');
                    }
                }
            });
        }
    }

    renderProfileInfoInner() {
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

        this.#config.createInfoItem(
            items,
            profileDataLayout['username'].icon,
            this.#config.data.profile.username
        );
        this.#config.createInfoItem(
            items,
            profileDataLayout['birth_date'].icon,
            convertDate(this.#config.data.profile.birth_date)
        );

        if (Object.keys(this.#config.data.contact_info).length > 0) {
            this.renderProfileInfoBlock(items, this.#config.data.contact_info);
        }

        if (Object.keys(this.#config.data.school).length > 0) {
            this.renderProfileInfoBlock(items, this.#config.data.school);
        }
        
        if (Object.keys(this.#config.data.university).length > 0) {
            this.renderProfileInfoBlock(items, this.#config.data.university);
        }

        // const countedItems = createElement({
        //     parent: contentWrapper,
        //     classes: ['modal-items-counted'],
        // });

        // for (const key in this.#config.data.countedData) {
        //     const value = this.#config.data.countedData[key];
        //     this.#config.createCountedItem(countedItems, profileDataLayout[key].text, value);
        // }
    }

    renderProfileInfoBlock(parent, blockData, showDivider = true) {
        if (showDivider) {
            createElement({
                parent,
                classes: ['modal__divider'],
            });
        }
        for (const key in blockData) {
            const value = blockData[key];
            this.#config.createInfoItem(parent, profileDataLayout[key].icon, value);
        }
    }
}
