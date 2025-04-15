import ChatComponent from './ChatComponent.js';
import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ContextMenuComponent from '../../Components/ContextMenuComponent/ContextMenuComponent.js';
import createElement from '../../utils/createElement.js';
import focusInput from '../../utils/focusInput.js';
import { setLsItem, getLsItem, removeLsItem } from '../../utils/localStorage.js';
import getTimeDifference from '../../utils/getTimeDifference.js';
import ws from '../../modules/WebSocketService.js';
import Ajax from '../../modules/ajax.js';
import router from '../../Router.js';


const TEXTAREA_PLACEHOLDER = 'Напишите сообщение...';
const HEADER_AVATAR_SIZE = 'xs';
const EMPTY_CHAT_WINDOW_TEXT = 'Выберите чат или создайте новый';
const CHAT_DEFAULT_PADDING_BOTTOM = 16;
const CHAT_MSG_PREFIX = 'chat-msg-';
const MSG_MAX_LENGTH = 4000;

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
    #parent;
    #config;
    #msgs = null;
    #chat = null;
    #chatElement = null;
    #chatData = null;
    #container = null;
    #chatsPanel = null;
    #focusTimer = null;
    #messageInput = null;
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;
        this.render();
    }

    render() {
        this.#container = createElement({
            parent: this.#parent,
            classes: ['chat-window'],
        });

        this.renderEmptyState();

        console.log(this.#config.chat_id, this.#config.receiver_username);

        if (!this.#config.chat_id && this.#config.receiver_username) {
            removeLsItem('active-chat');
            Ajax.get({
                url: `/profiles/${this.#config.receiver_username}`,
                callback: (status, chatUser) => {
                    switch (status) {
                        case 200:
                            this.#container.innerHTML = '';

                            this.#chatData = {
                                name: `${chatUser.profile.firstname} ${chatUser.profile.lastname}`,
                                online: chatUser.online,
                                avatar_url: chatUser.profile.avatar_url,
                                receiver_id: chatUser.id,
                                username: this.#config.receiver_username,
                            };

                            console.log(this.#chatData);

                            this.renderHeader();
                            this.renderChat();
                            this.renderMessageInput();

                            break;
                        case 401:
                            router.go({ path: '/login' });
                            break;
                        case 404:
                            router.go({ path: '/not-found' });
                            break;
                    }
                }
            });
        }

        ws.subscribe('message', (payload) => {
            console.log(payload);
            removeLsItem(CHAT_MSG_PREFIX + `${this.#chatData.id}`);
            if (!this.#chatData?.id && this.#chatData?.receiver_id) {
                setLsItem('active-chat', `chat-${payload.chat_id}`);
                this.#chatsPanel.renderChatList();
            } else {
                if (`chat-${payload.chat_id}` === getLsItem('active-chat', null)) { // payload.chat_id === this.#chatData?.id
                    this.#msgs.push(payload);
                    this.#chat.renderMsg(payload, []);
                    this.updateTextareaHeight();
                }
                this.#chatsPanel.renderLastMsg({
                    id: payload.chat_id,
                    last_message: {
                        text: payload.text,
                        created_at: payload.created_at,
                    }
                });
            }
            focusInput(this.#messageInput, this.#focusTimer);
        });
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

        this.#config.messenger.ajaxGetMessages({
            chatId: this.#chatData.id,
            count: 50,
        }, (status, chatMsgs) => {
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
            classes: ['chat-window__empty'],
        });

        createElement({
            parent: wrapper,
            classes: ['chat-window__empty-icon'],
        });

        createElement({
            parent: wrapper,
            text: EMPTY_CHAT_WINDOW_TEXT,
        });
    }

    renderHeader() {
        console.log(this.#chatData);

        const chatHeader = createElement({
            parent: this.#container,
            classes: ['chat-window__header'],
        });

        createElement({
            tag: 'button',
            parent: chatHeader,
            classes: ['modal__close']
        })
        .addEventListener('click', () => {
            this.close();
        });

        new AvatarComponent(chatHeader, {
            size: HEADER_AVATAR_SIZE,
            src: this.#chatData.avatar_url,
            href: `/profiles/${this.#chatData.username}`,
        });

        const chatInfo = createElement({
            parent: chatHeader,
            classes: ['chat-window__header-info'],
        });

        createElement({
            tag: 'a',
            parent: chatInfo,
            classes: ['chat-window__title'],
            text: this.#chatData.name,
            attrs: { href: `/profiles/${this.#chatData.username}` },
        });

        createElement({
            parent: chatInfo,
            classes: ['chat-window__status'],
            text: this.#chatData.online ? "в сети" : `заходил ${getTimeDifference(this.#chatData.last_seen, { mode: "long" })}`,
        });

        this.renderDropdown(chatHeader);
    }

    renderDropdown(parent) {
        const dropdown = createElement({
            classes: ['dropdown', 'chat-window__dropdown'],
            parent,
        });

        const optionsWrapper = createElement({
            classes: ['post__options'],
            parent: dropdown,
        });

        createElement({
            classes: ['post__options-icon'],
            parent: optionsWrapper,
        });

        new ContextMenuComponent(dropdown, {
            data: HEADER_CONTEXT_MENU_DATA,
        });
    }

    renderMessageInput() {
        const bottomWrapper = createElement({
            classes: ['chat-window__bottom'],
            parent: this.#container,
            attrs: { id: 'chat-window__bottom' },
        });

        const bottomBar = createElement({
            classes: ['chat-window__bottom-bar'],
            parent: bottomWrapper,
        });

        const dropdown = createElement({
            classes: ['dropdown', 'chat-window__media-dropdown'],
            parent: bottomBar,
        });

        new ContextMenuComponent(dropdown, {
            data: MEDIA_CONTEXT_MENU_DATA,
            size: 'mini',
            position: 'above-start',
        });

        createElement({
            classes: ['chat-window__media'],
            parent: dropdown,
        });

        const value = getLsItem(
            CHAT_MSG_PREFIX + `${this.#chatData.id}`,
            ''
        );

        this.#messageInput = createElement({
            tag: 'textarea',
            parent: bottomBar,
            classes: ['chat-window__msg'],
            attrs: {
                placeholder: TEXTAREA_PLACEHOLDER,
                rows: 1,
                maxLength: MSG_MAX_LENGTH,
            },
            text: value
        });
        focusInput(this.#messageInput, this.#focusTimer);

        const sendBtn = createElement({
            classes: [
                'chat-window__send',
                this.#messageInput.value.trim() === '' ? 'chat-window__send_disabled' : null
            ],
            parent: bottomBar,
        });

        sendBtn.addEventListener('click', () => this.sendMessage(sendBtn));

        this.#messageInput.addEventListener("input", () => {
            if (this.#messageInput.value.trim() !== '') {
                sendBtn.classList.remove('chat-window__send_disabled');
                setLsItem(
                    CHAT_MSG_PREFIX + `${this.#chatData.id}`,
                    this.#messageInput.value.trim()
                );
                return;
            }
            removeLsItem(CHAT_MSG_PREFIX + `${this.#chatData.id}`);
            this.#chatsPanel.renderLastMsg(this.#chatData);
            sendBtn.classList.add('chat-window__send_disabled');
        });

        this.#messageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.sendMessage(sendBtn);
            }
        });

        this.updateTextareaHeight(bottomWrapper);
        this.#messageInput.addEventListener("input", () => this.updateTextareaHeight(bottomWrapper));
    }

    sendMessage(sendBtn) {
        if (sendBtn.classList.contains('chat-window__send_disabled')) return;

        ws.send('message', {
            chat_id: this.#chatData?.id,
            receiver_id: this.#chatData?.receiver_id,
            text: this.#messageInput.value.trim(),
        });

        this.#messageInput.value = '';
        sendBtn.classList.add('chat-window__send_disabled');
    }

    updateTextareaHeight(
        bottomWrapper = document.getElementById('chat-window__bottom')
    ) {
        this.#messageInput.style.height = 'auto';
        this.#messageInput.style.height = (this.#messageInput.scrollHeight) + 'px';
        this.#chatElement.style.paddingBottom = bottomWrapper.scrollHeight + CHAT_DEFAULT_PADDING_BOTTOM + 'px';
        this.#chatElement.parentNode.scrollTop = this.#chatElement.parentNode.scrollHeight;
    }

    renderChat() {
        this.#chat = new ChatComponent(this.#container, {
            chatData: this.#chatData,
            messages: this.#msgs,
            user: this.#config.user,
        });

        this.#chatElement = this.#chat.scroll;
    }
}