import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import createElement from '@utils/createElement';


export default class NotificationComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    element: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.config = config;
        this.parent = parent;
        this.render();
    }

    render() {
        this.element = createElement({
            parent: this.parent,
            classes: ['notification', this.config.classes],
        });

        switch (this.config.type) {
            case 'msg':
                this.renderMsg();
                break;
        }
    }

    private renderMsg() {
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

        setTimeout(() => this.element.remove(), 5000);
    }
}
