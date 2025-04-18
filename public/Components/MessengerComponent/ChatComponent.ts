import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import getTime from '@utils/getTime';
import router from '@router';
import ws from '@modules/WebSocketService';
import { getLsItem } from '@utils/localStorage';


const MSG_AVATAR_SIZE = 'xs';
const EMPTY_STATE_AVATAR_SIZE = 'xxl';
const EMPTY_STATE_BTN_SIZE = 'small';
const EMPTY_STATE_BTN_VARIANT = 'secondary';
const EMPTY_STATE_CALL_TO_ACTION_TEXT = 'Напишите или отправьте стикер';
const OPEN_PROFILE_BTN_TEXT = 'Открыть профиль';
// const ADD_TO_FRIENDS_BTN_TEXT = 'Заявка отправлена';


export default class ChatComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private container: HTMLElement | null = null;
    private observer: IntersectionObserver;

    scroll: HTMLElement | null = null;
    private lastReadTime: number | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;

        this.observer = new IntersectionObserver(this.handleIntersect, {
            root: this.parent,
            threshold: 0.5,
        });

        this.render();
    }

    private scrollToTargetMsg() {
        if (!this.scroll) return;
      
        const messages = Array.from(this.scroll.querySelectorAll<HTMLElement>('[data-msg-id]'));
        if (!messages.length) return;

        let target: HTMLElement | null = null;
        for (const msg of messages) {
            const msgMoment = new Date(msg.dataset.msgTs);
            if (msgMoment.getTime() >= this.lastReadTime) {
                target = msg;
                break;
            }
        }
        if (!target) return;

        const headerHeight = this.parent.querySelector('.chat-window__header').clientHeight;
        const value = target.offsetTop - headerHeight - this.container.clientHeight + target.clientHeight;
        this.container.scrollTop = value;
    }

    private handleIntersect = (entries: IntersectionObserverEntry[]) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                ws.send('message_read', {
                    chat_id: this.config?.chatData?.id,
                    message_id: (entry.target as HTMLElement).dataset.msgId,
                });
                console.log(entry.target);
                // const status = entry.target.querySelector('.chat__msg-status');
                // status.classList.remove('chat__msg-status_unread');
                // status.classList.add('chat__msg-status_read');
                this.observer.unobserve(entry.target);
            }
        }
    };

    render() {
        if (this.config?.chatData?.last_read) {
            this.lastReadTime = new Date(this.config?.chatData?.last_read)?.getTime();
        }
        
        this.container = createElement({
            parent: this.parent,
            classes: ['chat'],
        });

        this.scroll = createElement({
            parent: this.container,
            classes: ['chat__scroll'],
        });

        if (!this.config.messages || !this.config.messages.length) {
            this.renderEmptyState();
            return;
        }

        let prevMsg: Record<string, any> = {};
        let prevDay = '';

        for (const msg of this.config.messages) {
            const classes = [];

            const curDay = this.formatDateTitle(msg.created_at);
            if (curDay !== prevDay) {
                createElement({
                    parent: this.scroll,
                    text: prevDay === '' ? this.formatDateTitle(msg.created_at) : curDay,
                    classes: ['chat__date'],
                });
            } else {
                if (msg.sender.id === prevMsg.sender.id) {
                    classes.push('chat__msg_nameless');
                }
            }

            this.renderMsg(msg, classes);

            prevMsg = msg;
            prevDay = this.formatDateTitle(msg.created_at);
        }

        this.scrollToTargetMsg();

        ws.subscribe('message_read', (payload: any) => {
            const readMessage = this.scroll.querySelector(`[data-msg-id="${payload.message_id}"]`) as HTMLElement;
            console.log(readMessage);
            const status = readMessage.querySelector('.chat__msg-status');
            status.classList.remove('chat__msg-status_unread');
            status.classList.add('chat__msg-status_read');
        });
    }

    renderEmptyState() {
        this.scroll?.classList.add('chat__scroll_empty');

        const infoWrapper = createElement({
            parent: this.scroll,
            classes: ['chat__profile']
        });

        new AvatarComponent(infoWrapper, {
            size: EMPTY_STATE_AVATAR_SIZE,
            src: this.config.chatData.avatar_url,
            href: `/profiles/${this.config.chatData.username}`,
        });

        createElement({
            tag: 'h1',
            parent: infoWrapper,
            text: this.config.chatData.name,
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
            onClick: () => router.go({ path: `/profiles/${this.config.chatData.username}` }),
        });
    }

    renderMsg(msgData: any, classes: Array<string>) {
        const msg = createElement({
            parent: this.scroll,
            classes: ['chat__msg', ...classes],
            attrs: {
                'data-msg-id': msgData.id.toString(),
                'data-msg-ts': msgData.created_at
            },
        });

        if (msgData.sender.username !== getLsItem('username', null)) {
            const msgTime = new Date(msgData.created_at).getTime();
            if (msgTime > this.lastReadTime) {
                this.observer.observe(msg);
            }
        }

        new AvatarComponent(msg, {
            size: MSG_AVATAR_SIZE,
            src: msgData.sender?.avatar_url || '',
            href: `/profiles/${msgData.sender?.username}`
        });

        const msgContent = createElement({
            parent: msg,
            classes: ['chat__msg-content'],
        });

        createElement({
            parent: msgContent,
            classes: ['chat__sender'],
            text: `${msgData.sender.firstname} ${msgData.sender.lastname}`
        });

        createElement({
            parent: msgContent,
            text: msgData.text,
        });

        const msgInfo = createElement({
            parent: msg,
            classes: ['chat__msg-info'],
        });

        if (msgData.sender.username === getLsItem('username', null)) {
            const msgTime = new Date(msgData.created_at).getTime();
            createElement({
                parent: msgInfo,
                classes: [
                    'chat__msg-status',
                    msgTime <= this.lastReadTime ? 'chat__msg-status_read' : 'chat__msg-status_unread'
                ],
            });
        }

        createElement({
            parent: msgInfo,
            classes: ['chat__msg-ts'],
            text: getTime(msgData.created_at),
        });
    }

    formatDateTitle(dateString: string) { // TODO: вынести в utils
        const date = new Date(dateString);
        const now = new Date();

        const nowDay = now.getUTCDate();
        const msgDay = date.getUTCDate();

        if (nowDay - msgDay === 0) {
            return 'Сегодня';
        } else if (nowDay - msgDay === 1) {
            return 'Вчера';
        } else {
            let month: number | string = date.getUTCMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            return `${msgDay}.${month}.${date.getUTCFullYear()}`;
        }
    }
}