import ChatComponent from './ChatComponent.js';
import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ContextMenuComponent from '../../Components/ContextMenuComponent/ContextMenuComponent.js';
import createElement from '../../utils/createElement.js';
import focusInput from '../../utils/focusInput.js';
import {setLsItem, getLsItem, removeLsItem} from '../../utils/localStorage.js';


const TEXTAREA_PLACEHOLDER = 'Напишите сообщение...';
const HEADER_AVATAR_SIZE = 'xs';
const EMPTY_CHAT_WINDOW_TEXT = 'Выберите чат или создайте новый';
const CHAT_DEFAULT_PADDING_BOTTOM = 16;
const CHAT_MSG_PREFIX = 'chat-msg-';

const HEADER_CONTEXT_MENU_DATA = {
    disableNotify: {
        href: '/disable-notify',
        text: 'Выключить уведомления',
        icon: 'bell-off-icon',
    },
    deleteHistory: {
        href: '/delete-history',
        text: 'Очистить историю',
        icon: 'broom-icon',
        isCritical: true
    },
    ban: {
        href: '/ban',
        text: 'Заблокировать',
        icon: 'ban-icon',
        isCritical: true
    },
};

const MEDIA_CONTEXT_MENU_DATA = {
    photo: {
        text: 'Фото',
        icon: 'primary-photo-icon',
    },
    video: {
        text: 'Видео',
        icon: 'videocamera-icon',
    },
    music: {
        text: 'Музыка',
        icon: 'primary-music-icon',
    },
    file: {
        text: 'Файл',
        icon: 'file-icon',
    },
};


export default class ChatWindowComponent {
    #parent
    #config
    #msgs
    #chatElement
    #chatData
    #container
    #chatsPanel
    #focusTimer
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.#chatElement = null;
        this.#chatData = null;
        this.#msgs = null;
        this.#container = null;
        this.#chatsPanel = null;
        this.#focusTimer = null;

        this.render();
    }

    render() {
        this.#container = createElement({
            parent: this.#parent,
            classes: ['messenger-right'],
        });

        this.renderEmptyState();
    }

    get chatData() {
        return this.#chatData;
    }

    set chatsPanel(chatsPanel) {
        this.#chatsPanel = chatsPanel;
    }

    renderActiveChat(chatData) {
        this.#chatData = chatData;
        this.#container.innerHTML = '';

        this.#config.messenger.ajaxGetChat(this.#chatData.username, (chatMsgs) => {
            this.#msgs = chatMsgs;
            this.renderHeader();
            this.renderChat();
            this.renderMessageInput();
        });
    }

    close() {
        this.#chatsPanel.close();
        this.renderEmptyState();
    }

    renderEmptyState() {
        this.#container.innerHTML = '';

        const wrapper = createElement({
            parent: this.#container,
            classes: ['chat-window-empty'],
        });

        createElement({
            parent: wrapper,
            classes: ['chat-window-empty-icon'],
        });

        createElement({
            parent: wrapper,
            text: EMPTY_CHAT_WINDOW_TEXT,
        });
    }

    renderHeader() {
        const chatHeader = createElement({
            parent: this.#container,
            classes: ['messenger-chat-header'],
        });

        createElement({
            tag: 'button',
            parent: chatHeader,
            classes: ['modal-window-close-btn']
        })
        .addEventListener('click', () => {
            this.close();
        });

        new AvatarComponent(chatHeader, {
            size: HEADER_AVATAR_SIZE,
            src: this.#chatData.avatar,
        });

        const chatInfo = createElement({
            parent: chatHeader,
            classes: ['messenger-header-info'],
        });

        createElement({
            parent: chatInfo,
            classes: ['messenger-header-title'],
            text: this.#chatData.name,
        });

        createElement({
            parent: chatInfo,
            classes: ['messenger-header-status'],
            text: 'заходил 2 часа назад', // TODO: делать запрос на user и отображать статус
        });

        this.renderDropdown(chatHeader);
    }

    renderDropdown(parent) {
        const dropdown = createElement({
            classes: ['dropdown', 'selected-chat'],
            parent,
        });

        const optionsWrapper = createElement({
            classes: ['post-options-wrapper'],
            parent: dropdown,
        });

        createElement({
            classes: ['post-options'],
            parent: optionsWrapper,
        });

        new ContextMenuComponent(dropdown, {
            data: HEADER_CONTEXT_MENU_DATA,
        });
    }

    renderMessageInput() {
        const bottomWrapper = createElement({
            classes: ['msg-bottom-wrapper'],
            parent: this.#container,
        });

        const bottomBar = createElement({
            classes: ['msg-bottom-bar'],
            parent: bottomWrapper,
        });

        const dropdown = createElement({
            classes: ['dropdown'],
            parent: bottomBar,
        });

        new ContextMenuComponent(dropdown, {
            data: MEDIA_CONTEXT_MENU_DATA,
            size: 'mini',
        });

        createElement({
            classes: ['msg-add-media'],
            parent: dropdown,
        });

        const value = getLsItem(
            CHAT_MSG_PREFIX + `${this.#config.user.username}-${this.#chatData.username}`,
            ''
        );

        const textarea = createElement({
            tag: 'textarea',
            parent: bottomBar,
            classes: ['msg-textarea'],
            attrs: {
                placeholder: TEXTAREA_PLACEHOLDER,
                rows: 1,
            },
            text: value
        });
        focusInput(textarea, this.#focusTimer);

        const sendBtn = createElement({
            classes: ['msg-send', textarea.value.trim() === '' ? 'disabled' : null],
            parent: bottomBar,
        });

        textarea.addEventListener("input", () => {
            if (textarea.value.trim() !== '') {
                sendBtn.classList.remove('disabled');
                setLsItem(
                    CHAT_MSG_PREFIX + `${this.#config.user.username}-${this.#chatData.username}`,
                    textarea.value.trim()
                );
                return;
            }
            removeLsItem(CHAT_MSG_PREFIX + `${this.#config.user.username}-${this.#chatData.username}`);
            this.#chatsPanel.renderLastMsg(this.#chatData);
            sendBtn.classList.add('disabled');
        });

        this.updateTextareaHeight(textarea, bottomWrapper);
        textarea.addEventListener("input", () => this.updateTextareaHeight(textarea, bottomWrapper));
    }

    updateTextareaHeight(textarea, bottomWrapper) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
        this.#chatElement.style.paddingBottom = bottomWrapper.scrollHeight + CHAT_DEFAULT_PADDING_BOTTOM + 'px';
        this.#chatElement.parentNode.scrollTop = this.#chatElement.parentNode.scrollHeight;
    }

    renderChat() {
        const chatWrapper = createElement({
            parent: this.#container,
            classes: ['messenger-chat-wrapper'],
        });

        this.#chatElement = new ChatComponent(chatWrapper, {
            chatData: this.#chatData,
            messages: this.#msgs,
            user: this.#config.user,
        })
        .container;
    }
}