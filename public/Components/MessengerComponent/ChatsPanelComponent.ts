import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ResizerComponent from '@components/ResizerComponent/ResizerComponent';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import createElement from '@utils/createElement';
import { setLsItem, getLsItem, removeLsItem } from '@utils/localStorage';
import getTimeDifference from '@utils/getTimeDifference';


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

    private chats: any = null;
    private _chatWindow: any = null;
    private isMobile: boolean;

    container: HTMLElement | null = null;
    activeChatItem: HTMLElement | null = null;
    chatItems: Array<any> = [];

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

    set chatWindow(chatWindow: any) {
        this._chatWindow = chatWindow;
    }

    renderChatList() {
        if (this.chats) {
            this.container?.removeChild(this.chats);
        }

        this.chats = createElement({
            parent: this.container,
            classes: ['chats-panel__chats'],
        });

        this.config.messenger.ajaxGetChats((status: number, chatsData: any) => {
            if (!chatsData || chatsData.length === 0) {
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
                const chatItem = this.renderChatItem(chatData);
                this.chatItems.push(chatItem);
                if (chatItem.id === activeChatId) {
                    this.activeChatItem = chatItem;
                    this.activeChatItem?.classList.add('chats-panel__chat_active');
                    this._chatWindow.renderActiveChat(chatData);
                }
            }
        });
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
        if (!this.activeChatItem) return;

        this.activeChatItem.classList.remove('chats-panel__chat_active');
        this.activeChatItem = null;
        this.renderDraftMessage();
        // this.renderLastMsg(this._chatWindow.chatData);
        removeLsItem('active-chat');
    }

    renderChatItem(chatData: any) {
        const chat = createElement({
            parent: this.chats,
            classes: ['chats-panel__chat'],
            attrs: {id: CHAT_PREFIX + chatData.id},
        });

        const handleChatItemClick = () => {
            if (chat === this.activeChatItem) return;
            this.close();
            chat.classList.add('chats-panel__chat_active');
            setLsItem('active-chat', CHAT_PREFIX + chatData.id);
            this.activeChatItem = chat;
            this._chatWindow.renderActiveChat(chatData);
        };

        chat.addEventListener('pointerup', () => handleChatItemClick());

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
            attrs: {id: CHAT_INFO_PREFIX + chatData.id},
        });

        this.renderLastMsg(chatData);

        return chat;
    }

    renderLastMsg(chatData: any) {
        const lastMsgWrapper = document.getElementById(CHAT_INFO_PREFIX + chatData.id);
        if (lastMsgWrapper) lastMsgWrapper.innerHTML = '';

        const draftValue = getLsItem(
            CHAT_MSG_PREFIX + `${chatData.id}`,
            ''
        );
        
        if (draftValue) {
            this.renderDraftMessage(lastMsgWrapper, draftValue);
        } else {
            createElement({
                parent: lastMsgWrapper,
                classes: ['chats-panel__msg'],
                text: draftValue ? draftValue : chatData.last_message.text,
            });
    
            createElement({
                parent: lastMsgWrapper,
                classes: ['chats-panel__msg-divider'],
                text: LAST_MSG_TIME_DIVIDER,
            });
    
            createElement({
                parent: lastMsgWrapper,
                text: getTimeDifference(chatData.last_message.created_at, { mode: 'short' }),
            });
        }
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