import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ResizerComponent from '../../Components/ResizerComponent/ResizerComponent.js';
import InputComponent from '../../Components/UI/InputComponent/InputComponent.js';
import createElement from '../../utils/createElement.js';
import {setLsItem, getLsItem, removeLsItem} from '../../utils/localStorage.js';


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
            classes: ['messenger-left'],
        });

        new ResizerComponent(this.container, {
            toDefaultWidth: RESIZER_TO_DEFAULT_WIDTH,
            toMiniWidth: RESIZER_TO_MINI_WIDTH,
            onResized: (width) => {
                setLsItem('chats-panel-size', width);
            },
        });

        const chatsPanelSize = getLsItem('chats-panel-size', `${DEFAULT_WIDTH}px`);
        if (chatsPanelSize === 'mini') {
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
            classes: ['messenger-chat-list'],
        });

        this.#config.messenger.ajaxGetChats((chatsData) => {
            const activeChatId = getLsItem('active-chat', null);
                
            for (const chatData of chatsData) {
                const chatItem = this.renderChatItem(chatData);
                this.chatItems.push(chatItem);
                if (chatItem.id === activeChatId) {
                    this.activeChatItem = chatItem;
                    this.activeChatItem.classList.add('active');
                    this.#chatWindow.renderActiveChat(chatData);
                }
            }
        });
    }

    close() {
        if (!this.activeChatItem) return;

        this.activeChatItem.classList.remove('active');
        this.activeChatItem = null;
        this.renderLastMsg(this.#chatWindow.chatData);
        removeLsItem('active-chat');
    }

    renderChatItem(chatData) {
        const chat = createElement({
            parent: this.#chats,
            classes: ['messenger-chat-item'],
            attrs: {id: CHAT_PREFIX + chatData.username},
        });

        chat.addEventListener('click', () => {
            if (chat === this.activeChatItem) return;
            this.close();

            chat.classList.add('active');
            setLsItem('active-chat', CHAT_PREFIX + chatData.username);
            this.activeChatItem = chat;
            this.#chatWindow.renderActiveChat(chatData);
        });

        new AvatarComponent(chat, {
            size: CHAT_ITEM_AVATAR_SIZE,
            src: chatData.avatar,
        });

        const chatInfo = createElement({
            parent: chat,
            classes: ['messenger-chat-info'],
        });

        createElement({
            parent: chatInfo,
            classes: ['messenger-chat-title'],
            text: chatData.name,
        });

        createElement({
            parent: chatInfo,
            classes: ['messenger-last-msg-wrapper'],
            attrs: {id: CHAT_INFO_PREFIX + chatData.username},
        });

        this.renderLastMsg(chatData);

        return chat;
    }

    renderLastMsg(chatData) {
        const lastMsgWrapper = document.getElementById(CHAT_INFO_PREFIX + chatData.username);
        lastMsgWrapper.innerHTML = '';

        const value = getLsItem(
            CHAT_MSG_PREFIX + `${this.#config.user.username}-${chatData.username}`,
            ''
        );
        
        if (value) {
            createElement({
                parent: lastMsgWrapper,
                classes: ['draft'],
                text: DRAFT_PREFIX_TEXT,
            });
        }
        createElement({
            parent: lastMsgWrapper,
            classes: ['messenger-last-msg'],
            text: value ? value : chatData.lastMsg,
        });

        createElement({
            parent: lastMsgWrapper,
            classes: ['messenger-msg-time-divider'],
            text: LAST_MSG_TIME_DIVIDER,
        });

        createElement({
            parent: lastMsgWrapper,
            classes: ['messenger-last-msg-time'],
            text: chatData.lastMsgTime,
        });
    }

    renderSearchBar() {
        const searchBar = createElement({
            parent: this.container,
            classes: ['messenger-search-bar'],
        });

        const searchBarTop = createElement({
            parent: searchBar,
            classes: ['messenger-search-bar-top'],
        });

        createElement({
            parent: searchBarTop,
            classes: ['messenger-search-bar-title'],
            text: CHATS_TITLE,
        });

        createElement({
            parent: searchBarTop,
            classes: ['messenger-filter'],
        });

        new InputComponent(searchBar, {
            type: 'search',
            placeholder: SEARCH_PLACEHOLDER,
            showRequired: false,
            classes: ['messenger-search']
        });
    }
}