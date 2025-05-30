import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import Router from '@router';
import createElement from '@utils/createElement';
import { Comment, Post } from 'types/PostTypes';
import { UserPublic } from 'types/UserTypes';


type NotificationType =
    'msg' |
    'post_liked' |
    'post_commented' |
    'comment_liked' |
    'friend_request_received' |
    'friend_request_accepted';


interface NotificationConfig {
    type: NotificationType;
    data: Record<string, any>;
    classes?: string[];
}


export default class NotificationComponent {
    static container: HTMLElement | null = null;
    
    private config: NotificationConfig;
    private element: HTMLElement | null = null;

    static initContainer() {
        if (!NotificationComponent.container) {
            NotificationComponent.container = createElement({
                classes: ['notification__container']
            });
        }
        NotificationComponent.container.remove();
        document.querySelector('.main').appendChild(NotificationComponent.container);
    }

    constructor(config: NotificationConfig) {
        NotificationComponent.initContainer();
        this.config = config;
        this.render();
    }

    render() {
        this.element = createElement({
            parent: NotificationComponent.container,
            classes: ['notification'],
        });

        if (this?.config?.classes?.length) {
            this.element.classList.add(...this.config.classes);
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.element!.classList.add('notification_visible');
            });
        });

        switch (this.config.type) {
            case 'msg':
                this.renderMsg();
                break;
            case 'post_liked':
                this.renderPostLiked();
                break;
            case 'post_commented':
                this.renderPostCommented();
                break;
            case 'comment_liked':
                this.renderCommentLiked();
                break;
            case 'friend_request_received':
                this.renderFriendRequestReceived();
                break;
            case 'friend_request_accepted':
                this.renderFriendRequestAccepted();
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

    private renderPostLiked() {
        const data = this.config.data as { post: Post, user: UserPublic };

        this.onClick(`/posts/${data?.post?.id}`);

        new AvatarComponent(this.element, {
            src: data?.user?.avatar_url || '',
            size: 'xs',
            href: `/profiles/${data?.user?.username}`
        });

        this.renderContent(
            ``,
            `${data?.user?.firstname} ${data?.user?.lastname} нравится ваш пост`
        );
    }

    private renderPostCommented() {
        const data = this.config.data as { post: Post, comment: Comment };

        this.onClick(`/posts/${data?.post?.id}`);

        new AvatarComponent(this.element, {
            src: data?.comment?.author?.avatar_url || '',
            size: 'xs',
            href: `/profiles/${data?.comment?.author?.username}`
        });

        this.renderContent(
            ``,
            `${data?.comment?.author?.firstname} ${data?.comment?.author?.lastname} оставил(-а) новый комментарий`
        );
    }

    private renderCommentLiked() {
        const data = this.config.data as { comment: Comment, user: UserPublic };

        this.onClick(`/posts/${data?.comment?.post_id}`);

        new AvatarComponent(this.element, {
            src: data?.user?.avatar_url || '',
            size: 'xs',
            href: `/profiles/${data?.user?.username}`
        });

        this.renderContent(
            ``,
            `${data?.user?.firstname} ${data?.user?.lastname} нравится ваш комментарий`
        );
    }

    private renderFriendRequestReceived() {
        const data = this.config.data as UserPublic;

        this.onClick(`/friends?section=incoming`);

        new AvatarComponent(this.element, {
            src: data?.avatar_url || '',
            size: 'xs',
            href: `/profiles/${data?.username}`
        });

        this.renderContent(
            ``,
            `${data?.firstname} ${data?.lastname} хочет добавить вас в друзья`
        );
    }

    private renderFriendRequestAccepted() {
        const data = this.config.data as UserPublic;

        this.onClick(`/profiles/${data?.username}`);

        new AvatarComponent(this.element, {
            src: data?.avatar_url || '',
            size: 'xs',
            href: `/profiles/${data?.username}`
        });

        this.renderContent(
            ``,
            `${data?.firstname} ${data?.lastname} принял(-а) вашу заявку в друзья`
        );
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

        this.renderContent(
            `${this.config?.data?.sender?.firstname} ${this.config?.data?.sender?.lastname}`,
            this.config?.data?.text
        );
    }

    private renderContent(
        title: string,
        text: string
    ) {
        const content = createElement({
            parent: this.element,
            classes: ['chat__msg-content'],
        });

        if (title) {
            createElement({
                parent: content,
                classes: ['chat__sender'],
                text: title,
            });
        }

        if (text) {
            createElement({
                parent: content,
                text,
                classes: ['notification_msg__text'],
            });
        }
    }

    private onClick(path: string) {
        this.element.onclick = () => {
            Router.go({ path });
        }
    }
}
