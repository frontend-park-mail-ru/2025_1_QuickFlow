import AvatarComponent from '../AvatarComponent/AvatarComponent.js';
import ButtonComponent from '../UI/ButtonComponent/ButtonComponent.js';
import createElement from '../../utils/createElement.js';
import getTime from '../../utils/getTime.js';


const MSG_AVATAR_SIZE = 'xs';
const EMPTY_STATE_AVATAR_SIZE = 'xxl';
const EMPTY_STATE_BTN_SIZE = 'small';
const EMPTY_STATE_BTN_VARIANT = 'secondary';
const EMPTY_STATE_CALL_TO_ACTION_TEXT = 'Напишите или отправьте стикер';
const OPEN_PROFILE_BTN_TEXT = 'Открыть профиль';
const ADD_TO_FRIENDS_BTN_TEXT = 'Заявка отправлена';


export default class MessageComponent {
    #parent
    #config
    #container
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.#container = null;
        this.scroll = null;

        this.render();
    }

    render() {
        this.#container = createElement({
            parent: this.#parent,
            classes: ['chat'],
        });

        this.scroll = createElement({
            parent: this.#container,
            classes: ['chat__scroll'],
        });

        if (!this.#config.messages || !this.#config.messages.length) {
            this.renderEmptyState();
            return;
        }

        let prevMsg = {};
        let prevDay = '';

        for (const msg of this.#config.messages) {
            const classes = [];

            const curDay = this.formatDateTitle(msg.created_at);
            if (curDay !== prevDay) {
                createElement({
                    parent: this.scroll,
                    text: prevDay === '' ? this.formatDateTitle(msg.created_at) : curDay,
                    classes: ['chat__date'],
                });
            } else {
                if (msg.sender_id === prevMsg.sender_id) {
                    classes.push('chat__msg_nameless');
                }
            }

            this.renderMsg(msg, classes);

            prevMsg = msg;
            prevDay = this.formatDateTitle(msg.created_at);
        }
    }

    renderEmptyState() {
        this.scroll.classList.add('chat__scroll_empty');

        const infoWrapper = createElement({
            parent: this.scroll,
            classes: ['chat__profile']
        });

        new AvatarComponent(infoWrapper, {
            size: EMPTY_STATE_AVATAR_SIZE,
            src: this.#config.chatData.avatar_url,
        });

        createElement({
            tag: 'h1',
            parent: infoWrapper,
            text: this.#config.chatData.name,
        });
        
        createElement({
            parent: infoWrapper,
            text: EMPTY_STATE_CALL_TO_ACTION_TEXT,
        });

        const btnsWrapper = createElement({
            parent: this.scroll,
            classes: ['chat__buttons'],
        });

        new ButtonComponent(btnsWrapper, {
            text: OPEN_PROFILE_BTN_TEXT,
            variant: EMPTY_STATE_BTN_VARIANT,
            size: EMPTY_STATE_BTN_SIZE,
        });

        new ButtonComponent(btnsWrapper, {
            text: ADD_TO_FRIENDS_BTN_TEXT,
            variant: EMPTY_STATE_BTN_VARIANT,
            size: EMPTY_STATE_BTN_SIZE,
        });
    }

    renderMsg(msgData, classes) {
        const msg = createElement({
            parent: this.scroll,
            classes: ['chat__msg', ...classes],
        });

        new AvatarComponent(msg, {
            size: MSG_AVATAR_SIZE,
            // src: msgData.sender_id === this.#config.chatData.name ? this.#config.user.profile.avatar_url : this.#config.chatData.avatar,
        });

        const msgContent = createElement({
            parent: msg,
            classes: ['chat__msg-content'],
        });

        createElement({
            parent: msgContent,
            classes: ['chat__sender'],
            text: "Заглушка"
            // text: msgData.sender_id === this.#config.user.profile.username ? `${this.#config.user.profile.firstname} ${this.#config.user.profile.lastname}` : this.#config.chatData.name,
        });

        createElement({
            parent: msgContent,
            text: msgData.text,
        });

        const msgInfo = createElement({
            parent: msg,
            classes: ['chat__msg-info'],
        });

        createElement({
            parent: msgInfo,
            classes: ['chat__msg-status', msgData.is_read ? 'chat__msg-status_read' : null],
        });

        createElement({
            parent: msgInfo,
            classes: ['chat__msg-ts'],
            text: getTime(msgData.created_at),
        });
    }

    formatDateTitle(dateString) { // TODO: вынести в utils
        const date = new Date(dateString);
        const now = new Date();

        const nowDay = now.getUTCDate();
        const msgDay = date.getUTCDate();

        if (nowDay - msgDay === 0) {
            return 'Сегодня';
        } else if (nowDay - msgDay === 1) {
            return 'Вчера';
        } else {
            let month = date.getUTCMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            return `${msgDay}.${month}.${date.getUTCFullYear()}`;
        }
    }
}