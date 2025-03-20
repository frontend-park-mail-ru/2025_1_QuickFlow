import ButtonComponent from '../ButtonComponent/ButtonComponent.js';
import TextareaComponent from '../TextareaComponent/TextareaComponent.js';
import createElement from '../../../utils/createElement.js';

export default class ModalWindowComponent {
    #config
    constructor(container, config) {
        this.container = container;
        this.#config = config;

        this.wrapper = null;
        this.modalWindow = null;
        this.title = null;
        this.render();
    }

    render() {
        document.body.style.overflow = 'hidden';

        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('modal-window-bg');
        this.container.appendChild(this.wrapper);

        this.modalWindow = document.createElement('div');
        this.modalWindow.classList.add('modal-window');
        this.wrapper.appendChild(this.modalWindow);

        const modalTop = document.createElement('div');
        modalTop.classList.add('modal-window-top');
        this.modalWindow.appendChild(modalTop);

        this.title = document.createElement('div');
        this.title.classList.add('modal-window-title');
        modalTop.appendChild(this.title);

        const closeBtn = document.createElement('button');
        closeBtn.classList.add('modal-window-close-btn');
        modalTop.appendChild(closeBtn);

        closeBtn.addEventListener('click', () => {
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
            class: 'modal-window-textarea'
        });

        new ButtonComponent(this.modalWindow, {
            text: 'Опубликовать',
            variant: 'primary',
            size: 'small',
            onClick: () => {

            },
            disabled: true,
            stateUpdaters: [textarea]
        });
    }

    renderProfileInfoInner() {
        this.modalWindow.classList.add('modal-window-profile');
        this.title.textContent = 'Подробная информация';

        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('modal-window-content');
        this.modalWindow.appendChild(contentWrapper);

        const items = document.createElement('div');
        items.classList.add('modal-window-items-default');
        contentWrapper.appendChild(items);

        Object.values(this.#config.data.fullInfo).forEach(({value, icon}) => {
            const item = createElement({
                parent: items,
                classes: ['profile-info-item']
            });
            createElement({
                parent: item,
                classes: ['profile-info-icon'],
                attrs: {src: `/static/img/${icon}-icon.svg`}
            });
            createElement({
                parent: item,
                classes: ['profile-info-text'],
                text: value
            });
        });

        const divider = document.createElement('div');
        divider.classList.add('modal-window-divider');
        contentWrapper.appendChild(divider);

        const countedItems = document.createElement('div');
        countedItems.classList.add('modal-window-items-counted');
        contentWrapper.appendChild(countedItems);

        Object.values(this.#config.data.countedInfo).forEach(({value, title}) => {
            const item = createElement({
                parent: countedItems,
                classes: ['modal-window-item-counted']
            });
            createElement({
                parent: item,
                text: value,
                classes: ['modal-window-count'],
            });
            createElement({
                parent: item,
                classes: ['profile-info-text'],
                text: title
            });
        });
    }
}
