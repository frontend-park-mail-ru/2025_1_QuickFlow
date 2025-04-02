import AvatarComponent from '../AvatarComponent/AvatarComponent.js';
import ButtonComponent from '../UI/ButtonComponent/ButtonComponent.js';
import createElement from '../../utils/createElement.js';


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
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.container = null;

        this.render();
    }

    render() {
        this.container = createElement({
            parent: this.#parent,
            classes: ['messenger-chat'],
        });

        if (!this.#config.messages || !this.#config.messages.length) {
            this.renderEmptyState();
            return;
        }

        let prevMsg = {};
        let prevDay = '';

        for (const msg of this.#config.messages) {
            const classes = [];

            const curDay = this.formatDateTitle(msg.timestamp);
            if (curDay !== prevDay) {
                createElement({
                    parent: this.container,
                    text: prevDay === '' ? this.formatDateTitle(msg.timestamp) : curDay,
                    classes: ['messenger-date-title'],
                });
            } else {
                if (msg.from === prevMsg.from) {
                    classes.push('no-from');
                }
            }

            this.renderMsg(msg, classes);

            prevMsg = msg;
            prevDay = this.formatDateTitle(msg.timestamp);
        }
    }

    renderEmptyState() {
        this.container.classList.add('empty');

        const infoWrapper = createElement({
            parent: this.container,
            classes: ['info-wrapper']
        });

        new AvatarComponent(infoWrapper, {
            size: EMPTY_STATE_AVATAR_SIZE,
            src: this.#config.chatData.avatar,
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
            parent: this.container,
            classes: ['btns-wrapper'],
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
            parent: this.container,
            classes: ['messenger-msg', ...classes],
        });

        new AvatarComponent(msg, {
            size: MSG_AVATAR_SIZE,
            src: msgData.from === this.#config.user.username ? this.#config.user.avatar : this.#config.chatData.avatar,
        });

        const msgContent = createElement({
            parent: msg,
            classes: ['msg-content'],
        });

        createElement({
            parent: msgContent,
            classes: ['msg-from'],
            text: msgData.from === this.#config.user.username ? `${this.#config.user.firstname} ${this.#config.user.lastname}` : this.#config.chatData.name,
        });

        createElement({
            parent: msgContent,
            classes: ['msg-text'],
            text: msgData.text,
        });

        const msgInfo = createElement({
            parent: msg,
            classes: ['msg-info'],
        });

        createElement({
            parent: msgInfo,
            classes: ['msg-status', msgData.isRead ? 'read' : null],
        });

        createElement({
            parent: msgInfo,
            classes: ['msg-sent-time'],
            text: '17:20', // TODO: подтягивать
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