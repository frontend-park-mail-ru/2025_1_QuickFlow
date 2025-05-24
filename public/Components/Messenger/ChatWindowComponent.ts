import ChatComponent from '@components/Messenger/ChatComponent';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ContextMenuComponent from '@components/ContextMenuComponent/ContextMenuComponent';
import createElement from '@utils/createElement';
import { setLsItem, getLsItem, removeLsItem } from '@utils/localStorage';
import getTimeDifference from '@utils/getTimeDifference';
import ws from '@modules/WebSocketService';
import router from '@router';
import ChatsPanelComponent from './ChatsPanelComponent';
import IFrameComponent from '@components/UI/IFrameComponent/IFrameComponent';
import { UsersRequests } from '@modules/api';
import MessageInputComponent from './MessageBar/MessageBarComponent';


const MOBILE_MAX_WIDTH = 610;
const HEADER_AVATAR_SIZE = 'xs';
const EMPTY_CHAT_WINDOW_TEXT = 'Выберите чат или создайте новый';

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


export default class ChatWindowComponent {
    private parent: HTMLElement | null = null;
    private config: Record<string, any> | null = null;
    
    private isMobile: boolean;

    private chat: ChatComponent | null = null;
    private chatElement: HTMLElement | null = null;
    private _chatData: Record<string, any> | null = null;
    private container: HTMLElement | null = null;
    private _chatsPanel: ChatsPanelComponent | null = null;
    private messageInput: MessageInputComponent | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
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

            const [status, profileData] = await UsersRequests.getProfile(this.config.receiver_username);

            switch (status) {
                case 200:
                    if (this.container) {
                        this.container.innerHTML = '';
                    }
                    this._chatData = {
                        id: profileData?.chat_id,
                        name: `${profileData.profile.firstname} ${profileData.profile.lastname}`,
                        online: profileData.online,
                        last_seen: profileData.last_seen,
                        avatar_url: profileData.profile.avatar_url,
                        receiver_id: profileData.id,
                        username: profileData.profile.username,
                    };
                    this.renderHeader();
                    // this.renderMessageInput();
                    this.renderChat();
                    this.messageInput = new MessageInputComponent(this.container, {
                        chatData: this._chatData,
                        renderLastMsg: this._chatsPanel?.renderLastMsg,
                        chatElement: this.chatElement,
                        chat: this.chat,
                    });
                    // this.renderChat();
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

            // removeLsItem(CHAT_MSG_PREFIX + `${this._chatData?.id}`);

            // Отправили первое сообщение
            if (!this._chatData?.id && this._chatData?.receiver_id) {
                setLsItem('active-chat', `chat-${payload.chat_id}`);
                this._chatsPanel?.renderChatList();

                const newUrl =
                    window.location.protocol +
                    "//" + window.location.host +
                    `/messenger/${this._chatData.username}?chat_id=${payload?.chat_id}`;

                window.history.pushState({ path: newUrl }, '', newUrl);

            // Отправили очередное сообщение
            } else {
                if (`chat-${payload.chat_id}` === getLsItem('active-chat', null)) {
                    this.chat?.pushMessage(payload);
                    this.messageInput.updateTextareaHeight();
                    // this.updateTextareaHeight();
                }
                this._chatsPanel?.renderLastMsg({
                    id: payload.chat_id,
                    last_message: {
                        text: payload.text,
                        created_at: payload.created_at,
                    }
                });
            }

            if (!this.isMobile) {
                this.messageInput?.focus();
            }
        });
    }

    get chatData() {
        return this._chatData;
    }

    set chatsPanel(chatsPanel: ChatsPanelComponent) {
        this._chatsPanel = chatsPanel;
    }

    renderActiveChat(chatData: Record<string, any>) {
        this._chatData = chatData;
        if (this.container) this.container.innerHTML = '';

        if (this.isMobile) {
            this._chatsPanel.container.classList.add('hidden');
            this.container.classList.remove('hidden');
            router.menu.container.classList.add('hidden');
        }

        this.renderHeader();
        this.renderChat();
        this.messageInput = new MessageInputComponent(this.container, {
            chatData: this._chatData,
            renderLastMsg: this._chatsPanel?.renderLastMsg,
            chatElement: this.chatElement,
            chat: this.chat,
        });
    }

    close() {
        this._chatsPanel?.close();
        if (this.isMobile) {
            this._chatsPanel.container.classList.remove('hidden');
            this.container.classList.add('hidden');
            router.menu.container.classList.remove('hidden');

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

        console.log(this._chatData);

        createElement({
            parent: chatInfo,
            classes: ['chat-window__status'],
            text: this._chatData?.online ? "в сети" : `заходил ${getTimeDifference(this._chatData?.last_seen, { mode: "long" })}`,
        });

        this.renderDropdown(chatHeader);
    }

    renderDropdown(parent: HTMLElement) {
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

    renderChat() {
        if (!this.container) return;

        this.chat = new ChatComponent(this.container, {
            chatData: this._chatData,
            user: this.config?.user,
        });

        this.chatElement = this.chat.scroll;
    }
}