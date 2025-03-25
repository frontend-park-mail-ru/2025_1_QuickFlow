import ButtonComponent from '../ButtonComponent/ButtonComponent.js';
import TextareaComponent from '../TextareaComponent/TextareaComponent.js';
import createElement from '../../../utils/createElement.js';
import {profileDataLayout} from '../../../Views/ProfileView/ProfileView.js'
import Ajax from '../../../modules/ajax.js';


export default class ModalWindowComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.wrapper = null;
        this.modalWindow = null;
        this.title = null;
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

        const textarea = new TextareaComponent(this.modalWindow, {
            placeholder: 'Поделитесь своими мыслями',
            classes: ['modal-window-textarea']
        });

        new ButtonComponent(this.modalWindow, {
            text: 'Опубликовать',
            variant: 'primary',
            size: 'small',
            onClick: () => {
                Ajax.post({
                    url: '/post',
                    body: {
                        text: textarea.textarea.value.trim(),
                        pics: [],
                    },
                    callback: () => {
                        // if (status === 200) {
                        //     this.#menu.goToPage(this.#menu.menuElements.feed);
                        //     this.#menu.checkAuthPage();
                        //     this.#menu.updateMenuVisibility(true);
                        //     this.#header.renderAvatarMenu();
                        // } else {
                        //     this.passwordInput.showError('Неверное имя пользователя или пароль');
                        //     this.passwordInput.addListener(() => {
                        //         this.passwordInput.hideError();
                        //         this.updateBtnState();
                        //     });
                        //     this.updateBtnState();
                        // }
                    }
                });
            },
            disabled: true,
            stateUpdaters: [textarea]
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
