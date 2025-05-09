import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import getTime from '@utils/getTime';
import router from '@router';
import ws from '@modules/WebSocketService';
import { getLsItem } from '@utils/localStorage';
import API from '@utils/api';
import ExtraLoadComponent from '@components/ExtraLoadComponent/ExtraLoadComponent';


const MSG_AVATAR_SIZE = 'xs';
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
    private msgsData: Record<string, any> = null;

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

        const [status, msgsData] = await API.getMessages(this.config?.chatData?.id, 50);
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

            this.renderMsg(msg, classes);

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
            marginPx: 500,
            position: 'top',
            fetchFn: this.fetchOlderMessages.bind(this),
            renderFn: (msgs) => {
                let prevSender = '';
                let prevDay = '';

                // 1. Сохраняем текущий первый видимый элемент
                const firstVisible = this.scroll.firstElementChild as HTMLElement;
                const previousTop = firstVisible?.getBoundingClientRect().top || 0;
                console.log(this.container.scrollTop);
                console.log(previousTop);

                const msgsArr: Array<HTMLElement> = [];

                for (const msg of msgs) {
                    const curDay = this.formatDateTitle(msg.created_at);
                    const classes = [];
        
                    if (curDay !== prevDay) {
                        const date = createElement({
                            // parent: this.scroll,
                            tag: 'div',
                            classes: ['chat__date'],
                            text: curDay,
                            // insertBefore: this.scroll.firstChild,
                        });
                        // this.scroll.prepend(date);
                        msgsArr.push(date);
                    } else if (msg.sender.username === prevSender) {
                        classes.push('chat__msg_nameless');
                    }
        
                    this.prependMsg(msg, classes, msgsArr);
        
                    prevSender = msg.sender.username;
                    prevDay = curDay;
                }

                msgsArr.reverse();
                for (const msg of msgsArr) {
                    this.scroll.prepend(msg);
                }

                // 3. Сравниваем новую позицию первого видимого элемента
                const newTop = firstVisible?.getBoundingClientRect().top || 0;
                console.log(newTop);
                const delta = newTop - previousTop;
                console.log(delta);

                // 4. Компенсируем изменение
                this.container.scrollTop += delta;
                console.log(this.container.scrollTop);
            }
        });        
    }

    pushMessage(payload: Record<string, any>) {
        this.msgsData?.messages?.push(payload);
        this.renderMsg(payload, []);
    }

    private scrollToTargetMsg() {
        if (!this.scroll) return;
      
        const messages = Array.from(this.scroll.querySelectorAll<HTMLElement>('[data-msg-id]'));
        if (!messages.length) return;

        let target: HTMLElement | null = null;
        for (const msg of messages) {
            const msgMoment = new Date(msg.dataset.msgTs);
            if (msgMoment.getTime() > this.lastReadByMeTime && msg.dataset.msgFrom !== getLsItem('username', null)) {
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
        console.log('handleIntersect');
        for (const entry of entries) {
            if (entry.isIntersecting) {
                console.log('handleIntersect isIntersecting=true');

                new ws().send('message_read', {
                    chat_id: this.config?.chatData?.id,
                    message_id: (entry.target as HTMLElement).dataset.msgId,
                });

                this.observer.unobserve(entry.target);

                console.log('handleIntersect isIntersecting=true ws-sended msg-unobserved');
            }
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

    renderMsg(msgData: any, classes: Array<string>) {
        const isMine = msgData.sender.username === getLsItem('username', null);
        const msgTime = new Date(msgData.created_at).getTime();

        const msg = createElement({
            parent: this.scroll,
            classes: ['chat__msg', ...classes],
            attrs: {
                'data-msg-id': msgData.id.toString(),
                'data-msg-ts': msgData.created_at,
                'data-msg-from': msgData.sender.username,
            },
        });

        if (!isMine) {
            if (msgTime > this.lastReadByMeTime) {
                this.observer.observe(msg);
                console.log('renderMsg msg-observed');
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

        if (isMine) {
            createElement({
                parent: msgInfo,
                classes: [
                    'chat__msg-status',
                    msgTime <= this.lastReadByOtherTime ? 'chat__msg-status_read' : 'chat__msg-status_unread'
                ],
            });
        }

        createElement({
            parent: msgInfo,
            classes: ['chat__msg-ts'],
            text: getTime(msgData.created_at),
        });
    }

    // private cbOk(feedData: any) {
    //     feedData?.forEach((config: Record<string, any>) => {
    //         this.renderPost(config);
    //         this.lastTs = config.created_at;
    //     });

    //     new ExtraLoadComponent<any>({
    //         sentinelContainer: this.posts!,
    //         marginPx: OBSERVER_MARGIN,
    //         fetchFn: this.fetchMorePosts.bind(this),
    //         renderFn: (posts) => {
    //             posts?.forEach((postConfig) => {
    //                 this.renderPost(postConfig);
    //                 this.lastTs = postConfig.created_at;
    //             });
    //         }
    //     });
    // }

    private async fetchOlderMessages(): Promise<any[]> {
        const firstMsg = this.scroll?.querySelector<HTMLElement>('[data-msg-ts]');
        const firstMsgTs = firstMsg?.dataset.msgTs;
    
        if (!firstMsgTs) return [];
    
        const [status, msgsData] = await API.getMessages(this.config?.chatData?.id, 50, firstMsgTs);
        // const [status, msgsData] = await API.getMessagesBefore(this.config?.chatData?.id, firstMsgTs, 20);
        if (status === 200 && Array.isArray(msgsData?.messages)) {
            return msgsData.messages;
        }
    
        return [];
    }

    private prependMsg(msgData: any, classes: string[], msgsArr: Array<HTMLElement>) {
        const isMine = msgData.sender.username === getLsItem('username', null);
        const msgTime = new Date(msgData.created_at).getTime();
    
        const msg = createElement({
            // parent: this.scroll,
            classes: ['chat__msg', ...classes],
            attrs: {
                'data-msg-id': msgData.id.toString(),
                'data-msg-ts': msgData.created_at,
                'data-msg-from': msgData.sender.username,
            },
            // insertBefore: this.scroll.firstChild,
        });

        msgsArr.push(msg);

        // this.scroll.prepend(msg);
    
        if (!isMine && msgTime > this.lastReadByMeTime) {
            this.observer.observe(msg);
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
    
        if (isMine) {
            createElement({
                parent: msgInfo,
                classes: [
                    'chat__msg-status',
                    msgTime <= this.lastReadByOtherTime ? 'chat__msg-status_read' : 'chat__msg-status_unread'
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
