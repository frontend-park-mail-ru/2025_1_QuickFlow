import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import Router from '@router';
import createElement from '@utils/createElement';


export default class NotificationComponent {
    private config: Record<string, any>;

    element: HTMLElement | null = null;

    // static container: HTMLElement = createElement({
    //     parent: document.querySelector('.main'),
    // });

    static container: HTMLElement | null = null;

    static initContainer() {
        if (!NotificationComponent.container) {
            NotificationComponent.container = createElement({
                parent: document.querySelector('.main'),
                classes: ['notification__container']
            });
        }
    }

    constructor(config: Record<string, any>) {
        NotificationComponent.initContainer();
        this.config = config;
        this.render();
    }

    render() {
        this.element = createElement({
            parent: NotificationComponent.container,
            classes: ['notification', this.config.classes],
        });

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.element!.classList.add('notification_visible');
            });
        });

        switch (this.config.type) {
            case 'msg':
                this.renderMsg();
                break;
        }

        setTimeout(() => {
            this.element!.classList.remove('notification_visible');
            this.element!.classList.add('notification_removing');
    
            this.element!.addEventListener('transitionend', () => {
                this.element?.remove();
            }, { once: true });
        }, 5000);
    }

    private renderMsg() {
        this.element.onclick = () => {
            Router.go({ path: `/messenger/${this.config?.data?.sender?.username}` });
        }

        new AvatarComponent(this.element, {
            src: this.config?.data?.sender?.avatar_url || '',
            size: 'xs',
            href: `/profiles/${this.config?.data?.sender?.username}`
        });

        const msgContent = createElement({
            parent: this.element,
            classes: ['chat__msg-content'],
        });

        createElement({
            parent: msgContent,
            classes: ['chat__sender'],
            text: `${this.config?.data?.sender?.firstname} ${this.config?.data?.sender?.lastname}`
        });

        createElement({
            parent: msgContent,
            text: this.config?.data?.text,
            classes: ['notification_msg__text'],
        });

        // setTimeout(() => this.element.remove(), 5000);
    }
}
