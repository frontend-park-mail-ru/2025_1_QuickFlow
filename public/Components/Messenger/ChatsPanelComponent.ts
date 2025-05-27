import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ResizerComponent from '@components/ResizerComponent/ResizerComponent';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import createElement from '@utils/createElement';
import { setLsItem, getLsItem, removeLsItem } from '@utils/localStorage';
import getTimeDifference from '@utils/getTimeDifference';
import router from '@router';
import { ChatsRequests } from '@modules/api';
import networkErrorPopUp from '@utils/networkErrorPopUp';
import ChatWindowComponent from './ChatWindowComponent';
import { Chat } from 'types/ChatsTypes';
import CounterComponent from '@components/CounterComponent/CounterComponent';
import Router from '@router';
import { VIDEO_EXTENSIONS } from '@config/config';


const REQUEST_CHATS_COUNT = 50;
const MOBILE_MAX_WIDTH = 610;
const DEFAULT_WIDTH = 300;
const RESIZER_TO_DEFAULT_WIDTH = 200;
const RESIZER_TO_MINI_WIDTH = 96;
const CHATS_TITLE = 'Чаты';
const SEARCH_PLACEHOLDER = 'Поиск';
const CHAT_ITEM_AVATAR_SIZE = 'm';
const LAST_MSG_TIME_DIVIDER = '•';
const DRAFT_PREFIX_TEXT = 'Черновик:';
const CHAT_INFO_PREFIX = 'chat-info-';
const CHAT_MSG_PREFIX = 'chat-msg-';
const CHAT_PREFIX = 'chat-';
const CLASS_SIZE_MINI = 'chats-panel_mini';
const EMPTY_CHATS_LIST_TEXT = "Начните общаться с друзьями, и здесь появятся ваши чаты";


export default class ChatsPanelComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    private _chatWindow: ChatWindowComponent = null;
    private isMobile: boolean;
    private activeChatItem: HTMLElement | null = null;
    private unreadMessages: Map<string, number> = new Map();

    public chats: HTMLElement = null;
    public container: HTMLElement | null = null;
    public chatItems: HTMLElement[] = [];

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
        this.render();
    }

    render() {
        this.container = createElement({
            parent: this.parent,
            classes: ['chats-panel'],
        });

        if (!this.isMobile) {
            this.createResizer();
            router.menu.container.classList.remove('hidden');
        }

        const chatsPanelSize = getLsItem('chats-panel-size', `${DEFAULT_WIDTH}px`);
        if (chatsPanelSize === CLASS_SIZE_MINI) {
            this.container?.classList.add(chatsPanelSize);
        } else {
            if (this.container) this.container.style.width = chatsPanelSize;
        }

        this.renderSearchBar();
        this.renderChatList();
    }

    createResizer() {
        new ResizerComponent(this.container, {
            classMini: CLASS_SIZE_MINI,
            toDefaultWidth: RESIZER_TO_DEFAULT_WIDTH,
            toMiniWidth: RESIZER_TO_MINI_WIDTH,
            onResized: (width: any) => {
                setLsItem('chats-panel-size', width);
            },
        });
    }

    set chatWindow(chatWindow: ChatWindowComponent) {
        this._chatWindow = chatWindow;
    }

    async renderChatList() {
        if (this.chats) {
            this.chats?.remove();
        }

        if (this?.chatItems) {
            this.chatItems = [];
        }

        this.chats = createElement({
            parent: this.container,
            classes: ['chats-panel__chats'],
        });

        const [status, chatsData] = await ChatsRequests.getChats(REQUEST_CHATS_COUNT);
        switch (status) {
            case 200:
                break;
            default:
                networkErrorPopUp({ text: 'Не удалось загрузить чаты' });
                return;
        }

        if (!chatsData?.length) {
            this.chats.classList.add('chats-panel__chats_empty');
            this.renderEmptyState();
            return;
        }

        if (this.config.chat_id) {
            setLsItem('active-chat', `chat-${this.config.chat_id}`);
        }

        let activeChatId: string | null = null;
        if (!this.isMobile) {
            activeChatId = getLsItem('active-chat', null);
        }

        for (const chatData of chatsData) {
            this.unreadMessages.set(chatData.id, chatData.unread_messages);

            const chatItem = this.renderChatItem(chatData);
            this.chatItems.push(chatItem);

            if (chatItem.id === activeChatId) {
                this.activeChatItem = chatItem;
                this.activeChatItem?.classList.add('chats-panel__chat_active');
                this._chatWindow.renderActiveChat(chatData);
            }
        }
    }

    public incrementMessagesCounter(chatId: string) {
        this.unreadMessages.set(chatId, this.unreadMessages.get(chatId) + 1);

        if (this.unreadMessages.get(chatId) === 1) {
            Router.menu.renderCounters('messenger');
        }
    }

    public decrementMessagesCounter(chatId: string) {
        const oldCount = this.unreadMessages.get(chatId);
        if (oldCount <= 0) {
            return;
        }
        this.unreadMessages.set(chatId, oldCount - 1);

        if (this.unreadMessages.get(chatId) === 0) {
            Router.menu.renderCounters('messenger');
        }
    }

    renderEmptyState() {
        this.chats.innerHTML = '';

        const wrapper = createElement({
            parent: this.chats,
            classes: ['chat-window__empty'],
        });

        createElement({
            parent: wrapper,
            classes: ['chat-window__empty-icon'],
        });

        createElement({
            parent: wrapper,
            text: EMPTY_CHATS_LIST_TEXT,
        });
    }

    close() {
        if (!this.activeChatItem) {
            return;
        }

        this.activeChatItem.classList.remove('chats-panel__chat_active');
        this.activeChatItem = null;
        this.renderDraftMessage();
        removeLsItem('active-chat');
    }

    renderChatItem(chatData: Chat) {
        const chat = createElement({
            parent: this.chats,
            classes: ['chats-panel__chat'],
            attrs: {id: CHAT_PREFIX + chatData.id},
        });

        chat.addEventListener('pointerup', () => this.onChatItemClick(chat, chatData));

        new AvatarComponent(chat, {
            size: CHAT_ITEM_AVATAR_SIZE,
            src: chatData.avatar_url,
        });

        const chatInfo = createElement({
            parent: chat,
            classes: ['chats-panel__chat-info'],
        });

        createElement({
            parent: chatInfo,
            classes: ['chats-panel__chat-title'],
            text: chatData.name,
        });

        createElement({
            parent: chatInfo,
            classes: ['chats-panel__msg-info'],
            attrs: { id: CHAT_INFO_PREFIX + chatData.id },
        });

        this.renderLastMsg(chatData);

        return chat;
    }

    private onChatItemClick(chat: HTMLElement, chatData: Chat) {
        if (chat === this.activeChatItem) {
            return;
        }

        this.close();
        chat.classList.add('chats-panel__chat_active');
        setLsItem('active-chat', CHAT_PREFIX + chatData.id);
        this.activeChatItem = chat;
        this._chatWindow.renderActiveChat(chatData);
    }

    renderLastMsg(chatData: any) {
        const chatItem = this.chatItems?.find(
            (item) => item.id === CHAT_PREFIX + chatData.id
        );

        if (chatItem) {
            chatItem.remove();
            this.chats.prepend(chatItem);
        }

        const lastMsgWrapper = this.chats?.querySelector(`#${CHAT_INFO_PREFIX + chatData.id}`) as HTMLElement;
        if (lastMsgWrapper) {
            lastMsgWrapper.innerHTML = '';
        }

        const draftValue = getLsItem(
            CHAT_MSG_PREFIX + `${chatData.id}`,
            ''
        );
        
        if (draftValue) {
            this.renderDraftMessage(lastMsgWrapper, draftValue);
            return;
        }

        let lastMessageText: string;
        const message = chatData?.last_message;

        if (message?.text) {
            lastMessageText = message?.text;
        } else if (message?.stickers?.length) {
            lastMessageText = "📄 Стикер"
        } else if (message?.media?.length) {
            const extension: string = message?.media[0]?.url.split('.').pop();
            const isVideo = VIDEO_EXTENSIONS.includes(extension);
            lastMessageText = `${isVideo ? '📹' : '🖼'} ${message?.media?.length} ${isVideo ? 'видео' : 'фото'}`;
        } else if (message?.files?.length) {
            lastMessageText = `📂 ${message?.files?.pop()?.name || 'Файл'}`
        } else if (message?.audio?.length) {
            lastMessageText = "🔊 Голосовое сообщение"
        }

        if (lastMsgWrapper?.dataset) {
            lastMsgWrapper.dataset.lastMessageId = message?.id;
        }

        createElement({
            parent: lastMsgWrapper,
            classes: ['chats-panel__msg'],
            text: lastMessageText,
        });

        createElement({
            parent: lastMsgWrapper,
            classes: ['chats-panel__msg-divider'],
            text: LAST_MSG_TIME_DIVIDER,
        });

        createElement({
            parent: lastMsgWrapper,
            text: getTimeDifference(message?.created_at, { mode: 'short' }),
        });

        const counterWrapper = createElement({
            parent: lastMsgWrapper,
            classes: ['chats-panel__counter-wrapper'],
        });

        new CounterComponent(counterWrapper, {
            value: this.unreadMessages.get(chatData.id),
            classes: ['chats-panel__counter'],
        });
    }

    renderDraftMessage(
        lastMsgWrapper = document.getElementById(CHAT_INFO_PREFIX + this._chatWindow.chatData.id),
        draftValue = getLsItem(CHAT_MSG_PREFIX + `${this._chatWindow.chatData.id}`, null)
    ) {
        if (!draftValue) return;

        if (lastMsgWrapper) lastMsgWrapper.innerHTML = '';

        createElement({
            parent: lastMsgWrapper,
            classes: ['chats-panel__draft'],
            text: DRAFT_PREFIX_TEXT,
        });
        
        createElement({
            parent: lastMsgWrapper,
            classes: ['chats-panel__msg'],
            text: draftValue,
        });
    }

    renderSearchBar() {
        const searchBar = createElement({
            parent: this.container,
            classes: ['chats-panel__header'],
        });

        const searchBarTop = createElement({
            parent: searchBar,
            classes: ['chats-panel__section'],
        });

        createElement({
            parent: searchBarTop,
            classes: ['chats-panel__title'],
            text: CHATS_TITLE,
        });

        createElement({
            parent: searchBarTop,
            classes: ['chats-panel__filter'],
        });

        new InputComponent(searchBar, {
            type: 'search',
            placeholder: SEARCH_PLACEHOLDER,
            showRequired: false,
            classes: ['chats-panel__search']
        });
    }
}