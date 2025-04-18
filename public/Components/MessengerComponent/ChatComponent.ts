import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import getTime from '@utils/getTime';
import router from '@router';


const MSG_AVATAR_SIZE = 'xs';
const EMPTY_STATE_AVATAR_SIZE = 'xxl';
const EMPTY_STATE_BTN_SIZE = 'small';
const EMPTY_STATE_BTN_VARIANT = 'secondary';
const EMPTY_STATE_CALL_TO_ACTION_TEXT = 'Напишите или отправьте стикер';
const OPEN_PROFILE_BTN_TEXT = 'Открыть профиль';
// const ADD_TO_FRIENDS_BTN_TEXT = 'Заявка отправлена';


export default class MessageComponent {
    private parent;
    private config;
    private container: HTMLElement | null = null;
    private observer: IntersectionObserver;
    scroll: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;

        this.observer = new IntersectionObserver(this.handleIntersect, {
            root: null, // или this.scroll, если нужен только внутри контейнера
            threshold: 0.5, // 50% элемента в зоне видимости
        });

        this.render();
    }

    private handleIntersect = (entries: IntersectionObserverEntry[]) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                console.log('ап');
                // можно также: console.log('ап:', entry.target.textContent);
                this.observer.unobserve(entry.target); // опционально, если нужно 1 раз
            }
        }
    };

    render() {
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

        // new ButtonComponent(btnsWrapper, {
        //     text: ADD_TO_FRIENDS_BTN_TEXT,
        //     variant: EMPTY_STATE_BTN_VARIANT,
        //     size: EMPTY_STATE_BTN_SIZE,
        // });
    }

    renderMsg(msgData: any, classes: Array<string>) {
        const msg = createElement({
            parent: this.scroll,
            classes: ['chat__msg', ...classes],
        });

        this.observer.observe(msg); // отслеживаем появление

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

        createElement({
            parent: msgInfo,
            classes: [
                'chat__msg-status',
                msgData.is_read ? 'chat__msg-status_read' : null
            ],
        });

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