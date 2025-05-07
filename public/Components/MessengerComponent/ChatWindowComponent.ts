import ChatComponent from '@components/MessengerComponent/ChatComponent';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ContextMenuComponent from '@components/ContextMenuComponent/ContextMenuComponent';
import createElement from '@utils/createElement';
import focusInput from '@utils/focusInput';
import { setLsItem, getLsItem, removeLsItem } from '@utils/localStorage';
import getTimeDifference from '@utils/getTimeDifference';
import ws from '@modules/WebSocketService';
import router from '@router';
import ChatsPanelComponent from './ChatsPanelComponent';
import IFrameComponent from '@components/UI/IFrameComponent/IFrameComponent';
import { MOBILE_MAX_WIDTH, MSG } from '@config';
import API from '@utils/api';


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
    private parent: HTMLElement | null = null;
    private config: Record<string, any> | null = null;
    
    private isMobile: boolean;

    // private msgsData: Array<any> | null = null;
    private msgsData: Record<string, any> | null = null;
    private chat: ChatComponent | null = null;
    private chatElement: HTMLElement | null = null;
    private _chatData: Record<string, any> | null = null;
    private container: HTMLElement | null = null;
    private _chatsPanel: ChatsPanelComponent | null = null;
    private focusTimer: any = null;
    private messageInput: HTMLTextAreaElement | null = null;

    constructor(parent: any, config: any) {
        this.parent = parent;
        this.config = config;
        this.isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
        this.render();
    }

    async render() {
        this.container = createElement({
            parent: this.parent,
            classes: ['chat-window'],
        });

        if (this.isMobile) {
            this.container.classList.add('hidden');
        }

        this.renderEmptyState();

        if (!this.config?.chat_id && this.config?.receiver_username) {
            removeLsItem('active-chat');

            const [status, profileData] = await API.getProfile(this.config.receiver_username);

            switch (status) {
                case 200:
                    if (this.container) {
                        this.container.innerHTML = '';
                    }
                    this._chatData = {
                        name: `${profileData.profile.firstname} ${profileData.profile.lastname}`,
                        online: profileData.online,
                        avatar_url: profileData.profile.avatar_url,
                        receiver_id: profileData.id,
                        username: this.config?.receiver_username,
                    };
                    this.renderHeader();
                    this.renderMessageInput();
                    this.renderChat();
                    break;

                case 401:
                    router.go({ path: '/login' });
                    break;

                case 404:
                    router.go({ path: '/not-found' });
                    break;
            }
        }

        new ws().subscribe('message', (payload: Record<string, any>) => {

            if (getLsItem('is-messenger-feedback-given', 'false') === 'false') {
                new IFrameComponent(this.parent.parentNode as HTMLElement, {
                    src: '/scores?type=messenger',
                    deleteOther: true,
                });
            }

            removeLsItem(CHAT_MSG_PREFIX + `${this._chatData?.id}`);

            if (!this._chatData?.id && this._chatData?.receiver_id) {
                setLsItem('active-chat', `chat-${payload.chat_id}`);
                this._chatsPanel?.renderChatList(true);
            } else {
                if (`chat-${payload.chat_id}` === getLsItem('active-chat', null)) {
                    this.msgsData?.messages?.push(payload);
                    // this.msgs?.push(payload);
                    this.chat?.renderMsg(payload, []);
                    this.updateTextareaHeight();
                }
                this._chatsPanel?.renderLastMsg({
                    id: payload.chat_id,
                    last_message: {
                        text: payload.text,
                        created_at: payload.created_at,
                    }
                });
            }

            if (this.messageInput) {
                focusInput(this.messageInput, this.focusTimer);
            }
        });
    }

    get chatData() {
        return this._chatData;
    }

    set chatsPanel(chatsPanel: ChatsPanelComponent) {
        this._chatsPanel = chatsPanel;
    }

    renderActiveChat(chatData: any) {
        this._chatData = chatData;
        if (this.container) this.container.innerHTML = '';

        if (this.isMobile) {
            this._chatsPanel.container.classList.add('hidden');
            this.container.classList.remove('hidden');
        }

        this.config?.messenger.ajaxGetMessages({
            chatId: this._chatData?.id,
            count: 50,
        }, (status: number, chatMsgs: any) => {
            this.msgsData = chatMsgs;
            this.renderHeader();
            this.renderMessageInput();
            this.renderChat();
        });
    }

    close() {
        this._chatsPanel?.close();
        if (this.isMobile) {
            this._chatsPanel.container.classList.remove('hidden');
            this.container.classList.add('hidden');
        }
        this.renderEmptyState();
    }

    renderEmptyState() {
        if (this.container) this.container.innerHTML = '';

        const wrapper = createElement({
            parent: this.container,
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
        const chatHeader = createElement({
            parent: this.container,
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
            src: this._chatData?.avatar_url,
            href: `/profiles/${this._chatData?.username}`,
        });

        const chatInfo = createElement({
            parent: chatHeader,
            classes: ['chat-window__header-info'],
        });

        createElement({
            tag: 'a',
            parent: chatInfo,
            classes: ['chat-window__title'],
            text: this._chatData?.name,
            attrs: { href: `/profiles/${this._chatData?.username}` },
        });

        createElement({
            parent: chatInfo,
            classes: ['chat-window__status'],
            text: this._chatData?.online ? "в сети" : `заходил ${getTimeDifference(this._chatData?.last_seen, { mode: "long" })}`,
        });

        this.renderDropdown(chatHeader);
    }

    renderDropdown(parent: HTMLElement) {
        const dropdown = createElement({
            classes: ['js-dropdown', 'dropdown', 'chat-window__dropdown'],
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
            parent: this.container,
            attrs: { id: 'chat-window__bottom' },
        });

        const bottomBar = createElement({
            classes: ['chat-window__bottom-bar'],
            parent: bottomWrapper,
        });

        const dropdown = createElement({
            classes: ['js-dropdown', 'dropdown', 'chat-window__media-dropdown'],
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
            CHAT_MSG_PREFIX + `${this._chatData?.id}`,
            ''
        );

        this.messageInput = createElement({
            tag: 'textarea',
            parent: bottomBar,
            classes: ['chat-window__msg'],
            attrs: {
                placeholder: TEXTAREA_PLACEHOLDER,
                rows: 1,
                maxLength: MSG.MAX_LEN,
            },
            text: value
        }) as HTMLTextAreaElement;
        if (this.messageInput) focusInput(this.messageInput, this.focusTimer);

        const sendBtn = createElement({
            classes: [
                'chat-window__send',
                this.messageInput?.value.trim() === '' ? 'chat-window__send_disabled' : null
            ],
            parent: bottomBar,
        });

        sendBtn.addEventListener('click', () => this.sendMessage(sendBtn));

        this.messageInput?.addEventListener("input", () => {
            if (this.messageInput?.value.trim() !== '') {
                sendBtn.classList.remove('chat-window__send_disabled');
                if (this.messageInput) setLsItem(
                    CHAT_MSG_PREFIX + `${this._chatData?.id}`,
                    this.messageInput.value.trim()
                );
                return;
            }
            removeLsItem(CHAT_MSG_PREFIX + `${this._chatData?.id}`);
            this._chatsPanel?.renderLastMsg(this._chatData);
            sendBtn.classList.add('chat-window__send_disabled');
        });

        this.messageInput?.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.sendMessage(sendBtn);
            }
        });

        this.updateTextareaHeight(bottomWrapper);
        this.messageInput?.addEventListener("input", () => this.updateTextareaHeight(bottomWrapper));
    }

    sendMessage(sendBtn: any) {
        if (sendBtn.classList.contains('chat-window__send_disabled')) return;

        new ws().send('message', {
            chat_id: this._chatData?.id,
            receiver_id: this._chatData?.receiver_id,
            text: this.messageInput?.value.trim(),
        });

        if (this.messageInput) this.messageInput.value = '';
        sendBtn.classList.add('chat-window__send_disabled');
    }

    updateTextareaHeight(
        bottomWrapper = document.getElementById('chat-window__bottom')
    ) {
        if (!this.chatElement || !this.messageInput || !bottomWrapper) return;
    
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    
        const parent = this.chatElement.parentNode as HTMLElement;
        const scrollThreshold = this.chat.scroll.lastElementChild.scrollHeight + 50; // если до конца меньше 50px, считаем "внизу"
    
        // обновляем паддинг у блока сообщений
        const newPadding = bottomWrapper.clientHeight - 62 + CHAT_DEFAULT_PADDING_BOTTOM;
        this.chatElement.style.paddingBottom = `${newPadding}px`;
    
        // проверяем, близок ли скролл к самому низу
        const scrollBottom = parent.scrollHeight - parent.scrollTop - parent.clientHeight;
        if (scrollBottom <= scrollThreshold) {
            parent.scrollTop = parent.scrollHeight;
        }
    }

    renderChat() {
        if (!this.container) return;

        this.chat = new ChatComponent(this.container, {
            chatData: this._chatData,
            msgsData: this.msgsData,
            user: this.config?.user,
        });

        this.chatElement = this.chat.scroll;
    }
}