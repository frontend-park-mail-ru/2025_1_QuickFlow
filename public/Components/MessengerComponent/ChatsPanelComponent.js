import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ResizerComponent from '../../Components/ResizerComponent/ResizerComponent.js';
import InputComponent from '../../Components/UI/InputComponent/InputComponent.js';
import createElement from '../../utils/createElement.js';
import {setLsItem, getLsItem, removeLsItem} from '../../utils/localStorage.js';
import getTimeDifference from '../../utils/getTimeDifference.js';


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


export default class ChatsPanelComponent {
    #parent
    #chats
    #config
    #chatWindow
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;
        
        this.#chats = null;
        this.#chatWindow = null;
        this.container = null;
        this.activeChatItem = null;
        this.chatItems = [];
        this.render();
    }

    render() {
        this.container = createElement({
            parent: this.#parent,
            classes: ['chats-panel'],
        });

        new ResizerComponent(this.container, {
            classMini: CLASS_SIZE_MINI,
            toDefaultWidth: RESIZER_TO_DEFAULT_WIDTH,
            toMiniWidth: RESIZER_TO_MINI_WIDTH,
            onResized: (width) => {
                setLsItem('chats-panel-size', width);
            },
        });

        const chatsPanelSize = getLsItem('chats-panel-size', `${DEFAULT_WIDTH}px`);
        if (chatsPanelSize === CLASS_SIZE_MINI) {
            this.container.classList.add(chatsPanelSize);
        } else {
            this.container.style.width = chatsPanelSize;
        }

        this.renderSearchBar();
        this.renderChatList();
    }

    set chatWindow(chatWindow) {
        this.#chatWindow = chatWindow;
    }

    renderChatList() {
        this.#chats = createElement({
            parent: this.container,
            classes: ['chats-panel__chats'],
        });

        this.#config.messenger.ajaxGetChats((status, chatsData) => {
            if (!chatsData || chatsData.length === 0) return;

            const activeChatId = this.#config.chat_id ? `chat-${this.#config.chat_id}` : getLsItem('active-chat', null);
            console.log(this.#config.chat_id);
            console.log(getLsItem('active-chat', null));
            for (const chatData of chatsData) {
                const chatItem = this.renderChatItem(chatData);
                this.chatItems.push(chatItem);
                if (chatItem.id === activeChatId) {
                    this.activeChatItem = chatItem;
                    this.activeChatItem.classList.add('chats-panel__chat_active');
                    this.#chatWindow.renderActiveChat(chatData);
                }
            }
        });
    }

    close() {
        if (!this.activeChatItem) return;

        this.activeChatItem.classList.remove('chats-panel__chat_active');
        this.activeChatItem = null;
        this.renderLastMsg(this.#chatWindow.chatData);
        removeLsItem('active-chat');
    }

    renderChatItem(chatData) {
        const chat = createElement({
            parent: this.#chats,
            classes: ['chats-panel__chat'],
            attrs: {id: CHAT_PREFIX + chatData.id},
        });

        chat.addEventListener('click', () => {
            if (chat === this.activeChatItem) return;
            this.close();

            chat.classList.add('chats-panel__chat_active');
            setLsItem('active-chat', CHAT_PREFIX + chatData.id);
            this.activeChatItem = chat;
            this.#chatWindow.renderActiveChat(chatData);
        });

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

    renderLastMsg(chatData) {
        const lastMsgWrapper = document.getElementById(CHAT_INFO_PREFIX + chatData.id);
        lastMsgWrapper.innerHTML = '';

        const draftValue = getLsItem(
            CHAT_MSG_PREFIX + `${chatData.id}`,
            ''
        );
        
        if (draftValue) {
            createElement({
                parent: lastMsgWrapper,
                classes: ['chats-panel__draft'],
                text: DRAFT_PREFIX_TEXT,
            });
        }
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