import ButtonComponent from '../ButtonComponent/ButtonComponent.js';
import TextareaComponent from '../TextareaComponent/TextareaComponent.js';
import createElement from '../../../utils/createElement.js';
import {profileDataLayout} from '../../../Views/ProfileView/ProfileView.js'
import Ajax from '../../../modules/ajax.js';
import FileInputComponent from '../FileInputComponent/FileInputComponent.js';


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
            classes: ['modal-window-bg'],
        });

        this.modalWindow = createElement({
            parent: this.wrapper,
            classes: ['modal-window'],
        });

        const modalTop = createElement({
            parent: this.modalWindow,
            classes: ['modal-window-top'],
        });

        this.title = createElement({
            parent: modalTop,
            classes: ['modal-window-title']
        });

        createElement({
            tag: 'button',
            parent: modalTop,
            classes: ['modal-window-close-btn']
        })
        .addEventListener('click', () => {
            this.close();
        });

        if (this.#config.type === 'create-post') {
            this.renderPostInner();
        } else if (this.#config.type === 'profile-full-info') {
            this.renderProfileInfoInner();
        }
    }

    close() {
        this.wrapper.remove();
        document.body.style.overflow = 'auto';
    }

    renderPostInner() {
        this.modalWindow.classList.add('modal-window-post');
        this.title.textContent = 'Новый пост';

        const picsWrapper = createElement({
            parent: this.modalWindow,
            classes: ['modal-window-pics-wrapper', 'blank'],
        });
        const addPicWrapper = createElement({
            parent: picsWrapper,
            classes: ['modal-window-add-pic-wrapper'],
        });
        createElement({
            parent: addPicWrapper,
            classes: ['modal-window-add-pic'],
            attrs: {src: 'static/img/camera-dark-icon.svg'},
        });
        createElement({
            tag: 'h4',
            parent: addPicWrapper,
            text: 'Добавьте фото',
        });

        this.fileInput = new FileInputComponent(picsWrapper, {
            imitator: addPicWrapper,
            preview: this.createPicWrapperTemplate(),
            id: 'post-pic-upload',
            onUpload: () => this.handlePicUpload(picsWrapper),
            multiple: true,
        });

        const textarea = new TextareaComponent(this.modalWindow, {
            placeholder: 'Поделитесь своими мыслями',
            classes: ['modal-window-textarea']
        });

        new ButtonComponent(this.modalWindow, {
            text: 'Опубликовать',
            variant: 'primary',
            size: 'small',
            onClick: () => this.handlePostSubmit(textarea.textarea.value.trim()),
            disabled: true,
            stateUpdaters: [textarea]
        });
    }

    createPicWrapperTemplate() {
        const picWrapperTemplate = createElement({
            classes: ['modal-window-pic-wrapper'],
        });
        createElement({
            tag: 'img',
            parent: picWrapperTemplate,
            classes: ['modal-window-pic'],
        });
        return picWrapperTemplate;
    }

    handlePicUpload(picsWrapper) {
        picsWrapper.classList.remove('blank');
    }

    async handlePostSubmit(text) {
        if (!text && !this.fileInput.input.files.length) {
            return;
        }

        const formData = new FormData();
        formData.append('text', text);

        if (this.fileInput.input.files.length > 0) {
            for (const file of this.fileInput.input.files) {
                formData.append('pics', file);
            }
        }

        Ajax.post({
            body: formData,
            isFormData: true,
            url: '/post',
            callback: (status) => {
                if (status === 200) {
                    this.close();
                } else if (status === 413) {
                    alert('File is too large');
                }
            }
        });
    }

    renderProfileInfoInner() {
        this.modalWindow.classList.add('modal-window-profile');
        this.title.textContent = 'Подробная информация';

        const contentWrapper = createElement({
            parent: this.modalWindow,
            classes: ['modal-window-content'],
        });

        const items = createElement({
            parent: contentWrapper,
            classes: ['modal-window-items-default'],
        });

        this.#config.createInfoItem(items, profileDataLayout['username'].icon, this.#config.data.username);
        for (const key in this.#config.data.additionalData) {
            const value = this.#config.data.additionalData[key];
            this.#config.createInfoItem(items, profileDataLayout[key].icon, value);
        }

        createElement({
            parent: contentWrapper,
            classes: ['divider'],
        });

        const countedItems = createElement({
            parent: contentWrapper,
            classes: ['modal-window-items-counted'],
        });

        for (const key in this.#config.data.countedData) {
            const value = this.#config.data.countedData[key];
            this.#config.createCountedItem(countedItems, profileDataLayout[key].text, value);
        }
    }
}
