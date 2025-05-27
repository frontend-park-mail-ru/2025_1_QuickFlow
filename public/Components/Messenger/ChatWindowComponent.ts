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
import { Chat, Message } from 'types/ChatsTypes';


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


interface ChatWindowConfig {
    chat_id: string;
    receiver_username: string;
}


export default class ChatWindowComponent {
    private parent: HTMLElement | null = null;
    private config: ChatWindowConfig | null = null;
    
    private isMobile: boolean;

    private chat: ChatComponent | null = null;
    private chatElement: HTMLElement | null = null;
    private _chatData: Record<string, any> | null = null;
    private container: HTMLElement | null = null;
    private _chatsPanel: ChatsPanelComponent | null = null;
    private messageInput: MessageInputComponent | null = null;

    constructor(parent: HTMLElement, config: ChatWindowConfig) {
        this.parent = parent;
        this.config = config;
        this.isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
        this.render();
    }

    private render() {
        this.container = createElement({
            parent: this.parent,
            classes: ['chat-window'],
        });

        if (this.isMobile) {
            this.container.classList.add('hidden');
        }

        this.renderEmptyState();

        if (!this.config?.chat_id && this.config?.receiver_username) {
            this.fetchChatData();
        }

        new ws().subscribe('message', (message: Message) => {
            this.renderFeedback();

            if (!this._chatData?.id && this._chatData?.receiver_id) {
                this.onFirstMessageSent(message);
            } else {
                this.onNewMessageSent(message);
            }

            if (!this.isMobile) {
                this.messageInput?.focus();
            }
        });
    }

    private async fetchChatData() {
        const [status, profileData] = await UsersRequests.getProfile(this.config.receiver_username);

        switch (status) {
            case 401:
                router.go({ path: '/login' });
                return;
            case 404:
                router.go({ path: '/not-found' });
                return;
        }

        removeLsItem('active-chat');

        const chatData = {
            id: profileData?.chat_id,
            name: `${profileData.profile.firstname} ${profileData.profile.lastname}`,
            online: profileData.online,
            last_seen: profileData.last_seen,
            avatar_url: profileData.profile.avatar_url,
            receiver_id: profileData.id,
            username: profileData.profile.username,
        };

        this.renderActiveChat(chatData);
    }

    private renderFeedback() {
        if (getLsItem('is-messenger-feedback-given', 'false') !== 'false') {
            return;
        }

        new IFrameComponent(this.parent.parentNode as HTMLElement, {
            src: '/scores?type=messenger',
            deleteOther: true,
        });
    }

    private onNewMessageSent(message: Message) {
        if (`chat-${message.chat_id}` === getLsItem('active-chat', null)) {
            this.chat?.pushMessage(message);
            this.messageInput.updateTextareaHeight();
        } else {
            this._chatsPanel.incrementMessagesCounter(message.chat_id);
        }

        this._chatData.id = message.chat_id;
        this._chatData.last_message = message;
        // this._chatData.last_message.text = message.text;
        // this._chatData.last_message.created_at = message.created_at;

        this._chatsPanel?.renderLastMsg(this._chatData);

        // this._chatsPanel?.renderLastMsg({
        //     id: message.chat_id,
        //     last_message: {
        //         text: message.text,
        //         created_at: message.created_at,
        //     }
        // });
    }

    private onFirstMessageSent(message: Message) {
        setLsItem('active-chat', `chat-${message.chat_id}`);
        this._chatsPanel?.renderChatList();

        const newUrl =
            window.location.protocol +
            "//" + window.location.host +
            `/messenger/${this._chatData.username}?chat_id=${message?.chat_id}`;

        window.history.pushState({ path: newUrl }, '', newUrl);
    }

    get chatData() {
        return this._chatData;
    }

    set chatsPanel(chatsPanel: ChatsPanelComponent) {
        this._chatsPanel = chatsPanel;
    }

    public renderActiveChat(chatData: Chat | Record<string, any>) {
        this._chatData = chatData;

        if (this.container) {
            this.container.innerHTML = '';
        }

        if (this.isMobile) {
            this._chatsPanel.container.classList.add('hidden');
            this.container.classList.remove('hidden');
            router.menu.container.classList.add('hidden');
        }

        setLsItem('active-chat', `chat-${this._chatData.id}`);

        this.renderHeader();
        this.renderChat();
        this.messageInput = new MessageInputComponent(this.container, {
            chatData: this._chatData,
            chatsPanel: this._chatsPanel,
            // renderLastMsg: this._chatsPanel?.renderLastMsg.bind(this),
            chatElement: this.chatElement,
            chat: this.chat,
        });
    }

    private close() {
        this._chatsPanel?.close();
        if (this.isMobile) {
            this._chatsPanel.container.classList.remove('hidden');
            this.container.classList.add('hidden');
            router.menu.container.classList.remove('hidden');

        }
        this.renderEmptyState();
    }

    private renderEmptyState() {
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

    private renderHeader() {
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

    private renderDropdown(parent: HTMLElement) {
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

    private renderChat() {
        if (!this.container) {
            return;
        }

        this.chat = new ChatComponent(this.container, {
            chatData: this._chatData,
            // user: this.config?.user,
            chatsPanel: this._chatsPanel,
            onMessageRead: (newLastReadByMe: string) => {
                this._chatData.last_read_by_me = newLastReadByMe;
            },
        });

        this.chatElement = this.chat.scroll;
    }
}