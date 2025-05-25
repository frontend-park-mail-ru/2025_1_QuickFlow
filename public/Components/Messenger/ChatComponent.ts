import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import router from '@router';
import ws from '@modules/WebSocketService';
import ExtraLoadComponent from '@components/ExtraLoadComponent/ExtraLoadComponent';
import { ChatsRequests } from '@modules/api';
import LsProfile from '@modules/LsProfile';
import MessageComponent from './MessageComponent/MessageComponent';
import { Message, MessagesResponse } from 'types/ChatsTypes';


const EXTRA_LOAD_MARGIN = 500;
const EMPTY_STATE_AVATAR_SIZE = 'xxl';
const EMPTY_STATE_BTN_SIZE = 'small';
const EMPTY_STATE_BTN_VARIANT = 'secondary';
const EMPTY_STATE_CALL_TO_ACTION_TEXT = 'Напишите или отправьте стикер';
const OPEN_PROFILE_BTN_TEXT = 'Открыть профиль';


export default class ChatComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private container: HTMLElement | null = null;
    private observer: IntersectionObserver;

    scroll: HTMLElement | null = null;
    private lastReadByMeTime: number | null = null;
    private lastReadByOtherTime: number | null = null;
    private msgsData: MessagesResponse = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;

        this.observer = new IntersectionObserver(this.handleIntersect, {
            root: this.parent,
            threshold: 0,
        });

        this.render();
    }

    async render() {
        this.container = createElement({
            parent: this.parent,
            classes: ['chat'],
        });

        this.scroll = createElement({
            parent: this.container,
            classes: ['chat__scroll'],
        });

        const [status, msgsData] = await ChatsRequests.getMessages(this.config?.chatData?.id, 50);
        this.msgsData = msgsData;

        switch (status) {
            case 200:
                this.renderChat();
                break;
            case 404:
                this.renderEmptyState();
                break;
        }
    }

    private renderChat() {
        if (this.config?.chatData?.last_read_by_me) {
            this.lastReadByMeTime = new Date(this.config?.chatData?.last_read_by_me)?.getTime();
        }

        if (this.msgsData?.last_read_ts) {
            this.lastReadByOtherTime = new Date(this.msgsData?.last_read_ts)?.getTime();
        }

        if (!this.msgsData?.messages || !this.msgsData?.messages?.length) {
            this.renderEmptyState();
            return;
        }

        let prevMsg: Record<string, any> = {};
        let prevDay = '';

        for (const msg of this.msgsData?.messages) {
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

            new MessageComponent({
                parent: this.scroll,
                data: msg,
                lastReadByMeTime: this.lastReadByMeTime,
                lastReadByOtherTime: this.lastReadByOtherTime,
                classes,
                position: 'bottom',
                observer: this.observer,
            });

            prevMsg = msg;
            prevDay = this.formatDateTitle(msg.created_at);
        }

        this.scrollToTargetMsg();

        new ws().subscribe('message_read', (payload: any) => {
            const timeout = setTimeout(() => {
                const readMessage = this.scroll.querySelector(`[data-msg-id="${payload.message_id}"]`) as HTMLElement;
                const status = readMessage.querySelector('.chat__msg-status');
                status.classList.remove('chat__msg-status_unread');
                status.classList.add('chat__msg-status_read');
                clearTimeout(timeout);
            }, 50);
        });

        new ExtraLoadComponent<any>({
            sentinelContainer: this.scroll!,
            marginPx: EXTRA_LOAD_MARGIN,
            position: 'top',
            fetchFn: this.fetchOlderMessages.bind(this),
            renderFn: (msgs) => {
                let prevSender = '';
                let prevDay = '';

                // 1. Сохраняем текущий первый видимый элемент
                const firstVisible = this.scroll.firstElementChild as HTMLElement;
                const previousTop = firstVisible?.getBoundingClientRect().top || 0;

                const msgsArr: Array<HTMLElement> = [];

                for (const msg of msgs) {
                    const curDay = this.formatDateTitle(msg.created_at);
                    const classes = [];
        
                    if (curDay !== prevDay) {
                        const date = createElement({
                            tag: 'div',
                            classes: ['chat__date'],
                            text: curDay,
                        });
                        msgsArr.push(date);
                    } else if (msg.sender.username === prevSender) {
                        classes.push('chat__msg_nameless');
                    }
        
                    const msgObj = new MessageComponent({
                        data: msg,
                        lastReadByMeTime: this.lastReadByMeTime,
                        lastReadByOtherTime: this.lastReadByOtherTime,
                        classes,
                        observer: this.observer,
                    });
                    msgsArr.push(msgObj.element);
        
                    prevSender = msg.sender.username;
                    prevDay = curDay;
                }

                msgsArr.reverse();
                for (const msg of msgsArr) {
                    this.scroll.prepend(msg);
                }

                // 3. Сравниваем новую позицию первого видимого элемента
                const newTop = firstVisible?.getBoundingClientRect().top || 0;
                const delta = newTop - previousTop;

                // 4. Компенсируем изменение
                this.container.scrollTop += delta;
            }
        });        
    }

    public pushMessage(payload: Message) {
        this.msgsData?.messages?.push(payload);

        new MessageComponent({
            parent: this.scroll,
            data: payload,
            lastReadByMeTime: this.lastReadByMeTime,
            lastReadByOtherTime: this.lastReadByOtherTime,
            classes: [],
            position: 'bottom',
            observer: this.observer,
        });
    }

    private scrollToTargetMsg() {
        if (!this.scroll) return;
      
        const messages = Array.from(this.scroll.querySelectorAll<HTMLElement>('[data-msg-id]'));
        if (!messages.length) return;

        let target: HTMLElement | null = null;
        for (const msg of messages) {
            const msgMoment = new Date(msg.dataset.msgTs);
            if (msgMoment.getTime() > this.lastReadByMeTime && msg.dataset.msgFrom !== LsProfile.username) {
                target = msg;
                break;
            }
        }
        if (!target) {
            this.container.scrollTop = this.container.scrollHeight;
            return;
        }

        const headerHeight = this.parent.querySelector('.chat-window__header').clientHeight;
        const value = target.offsetTop - headerHeight - this.container.clientHeight + target.clientHeight;
        this.container.scrollTop = value;
    }

    private handleIntersect = (entries: IntersectionObserverEntry[]) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) {
                continue;
            }

            new ws().send('message_read', {
                chat_id: this.config?.chatData?.id,
                message_id: (entry.target as HTMLElement).dataset.msgId,
            });

            this.observer.unobserve(entry.target);
        }
    };

    renderEmptyState() {
        this.scroll?.classList.add('chat__scroll_empty');

        const infoWrapper = createElement({
            parent: this.scroll,
            classes: ['chat__profile']
        });

        new AvatarComponent(infoWrapper, {
            size: EMPTY_STATE_AVATAR_SIZE,
            src: this.config?.chatData?.avatar_url,
            href: `/profiles/${this.config?.chatData?.username}`,
        });

        createElement({
            tag: 'h1',
            parent: infoWrapper,
            text: this.config?.chatData?.name,
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
            onClick: () => router.go({ path: `/profiles/${this.config?.chatData?.username}` }),
        });
    }

    private async fetchOlderMessages(): Promise<any[]> {
        const firstMsg = this.scroll?.querySelector<HTMLElement>('[data-msg-ts]');
        const firstMsgTs = firstMsg?.dataset.msgTs;
    
        if (!firstMsgTs) return [];
    
        const [status, msgsData] = await ChatsRequests.getMessages(this.config?.chatData?.id, 50, firstMsgTs);
        if (status === 200 && Array.isArray(msgsData?.messages)) {
            return msgsData.messages;
        }
    
        return [];
    }

    private formatDateTitle(dateString: string) { // TODO: вынести в utils
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
