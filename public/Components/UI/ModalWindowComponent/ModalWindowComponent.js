import ButtonComponent from '../ButtonComponent/ButtonComponent.js';
import TextareaComponent from '../TextareaComponent/TextareaComponent.js';

export default class ModalWindowComponent {
    constructor(container, config) {
        this.container = container;
        this.config = config;

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

        if (this.config.type === 'create-post') {
            this.renderPostInner();
        } else if (this.config.type === 'profile-full-info') {
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

        this.renderInfoItems(contentWrapper);

        const divider = document.createElement('div');
        divider.classList.add('modal-window-divider');
        contentWrapper.appendChild(divider);

        this.renderCountedInfoItems(contentWrapper);
    }

    renderCountedInfoItems(parent) {
        const countedInfoItems = document.createElement('div');
        countedInfoItems.classList.add('modal-window-counted-items');
        parent.appendChild(countedInfoItems);

        Object.entries(this.config.data.countedInfo).forEach(([, {title, value}],) => {
            const countedInfoItem = document.createElement('div');
            countedInfoItem.classList.add('modal-window-counted-item');
            countedInfoItems.appendChild(countedInfoItem);

            const count = document.createElement('div');
            count.classList.add('modal-window-count');
            count.textContent = value;
            countedInfoItem.appendChild(count);
    
            const titleElement = document.createElement('div');
            titleElement.classList.add('profile-info-text');
            titleElement.textContent = title;
            countedInfoItem.appendChild(titleElement);
        });
    }

    renderInfoItems(parent) {
        const infoItems = document.createElement('div');
        infoItems.classList.add('modal-window-info-items');
        parent.appendChild(infoItems);

        Object.entries(this.config.data.fullInfo).forEach(([, {title, value, icon}],) => {
            const infoItem = document.createElement('div');
            infoItem.classList.add('profile-info-item');
            infoItems.appendChild(infoItem);
    
            const infoIcon = document.createElement('img');
            infoIcon.src = `/static/img/${icon}-icon.svg`;
            infoIcon.classList.add('profile-info-icon');
            infoItem.appendChild(infoIcon);
    
            const infoText = document.createElement('div');
            infoText.classList.add('profile-info-text');
            infoText.textContent = `${title}: ${value}`;
            infoItem.appendChild(infoText);
        });
    }
}
