import AvatarComponent from "@components/AvatarComponent/AvatarComponent";
import createElement from "@utils/createElement";
import LikeComponent from "../LikeComponent/LikeComponent";
import { CommentsRequests } from "@modules/api";
import { Comment } from "types/PostTypes";
import formatTimeAgo from "@utils/formatTimeAgo";


interface CommentConfig {
    data: Comment;
}


const DIVIDER_SYMBOL = '•';
const READ_MORE_BTN_TEXT = 'Показать ещё';
const READ_LESS_BTN_TEXT = 'Скрыть';
const AVATAR_SIZE = 'xxs';


export default class CommentComponent {
    private parent: HTMLElement;
    private config: CommentConfig;

    public element: HTMLElement;

    constructor(parent: HTMLElement, config: CommentConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        if (this.parent.innerHTML !== '') {
            createElement({
                parent: this.parent,
                classes: ['comments__divider', 'comments__divider_small'],
            });
        }

        const comment = createElement({
            parent: this.parent,
            classes: ['comment'],
        });

        new AvatarComponent(comment, {
            src: this.config.data.author?.avatar_url,
            size: AVATAR_SIZE,
        });

        const content = createElement({
            parent: comment,
            classes: ['comment__content'],
        });

        this.renderHeader(content);
        this.renderText(content);
    }
    
    private renderHeader(parent: HTMLElement) {
        const header = createElement({
            parent,
            classes: ['comment__header'],
        });

        const headerInfo = createElement({
            parent: header,
            classes: ['comment__header-info'],
        });

        createElement({
            parent: headerInfo,
            classes: ['comment__author'],
            text: `${this.config.data.author.firstname} ${this.config.data.author.lastname}`,
        });

        createElement({
            parent: headerInfo,
            classes: ['comment__time'],
            text: DIVIDER_SYMBOL,
        });

        createElement({
            parent: headerInfo,
            classes: ['comment__time'],
            text: formatTimeAgo(this.config.data.created_at),
        });

        const actions = createElement({
            parent: header,
            classes: ['comment__actions'],
        });

        // const replyAction = createElement({
        //     parent: actions,
        //     classes: ['comment__action'],
        // });

        // insertIcon(replyAction, {
        //     name: 'reply-icon',
        //     classes: ['comment__action-icon'],
        // });

        // createElement({
        //     parent: replyAction,
        //     text: 'Ответить',
        // });

        new LikeComponent(actions, {
            isLiked: this.config.data.is_liked,
            targetId: this.config.data.id,
            likeCount: this.config.data.like_count,
            classes: ['comment__action'],
            putMethod: CommentsRequests.putLike,
            removeMethod: CommentsRequests.deleteComment,
        });
    }

    private renderText(parent: HTMLElement) {
        const textWrapper = createElement({
            parent,
            classes: ['comment__text-wrapper'],
        });
    
        const text = createElement({
            parent: textWrapper,
            classes: ['comment__text'],
            text: this.config.data.text,
        });
    
        const readMore = createElement({
            tag: 'p',
            parent: textWrapper,
            classes: ['comment__more'],
            text: READ_MORE_BTN_TEXT,
            attrs: { style: 'display: none;' }
        });

        requestAnimationFrame(() => {
            if (text.scrollHeight > text.clientHeight) {
                readMore.style.display = 'inline-block';
            }
        });

        readMore.addEventListener('click', () => {
            if (text.classList.contains('comment__text_expanded')) {
                text.classList.remove('comment__text_expanded');
                readMore.textContent = READ_MORE_BTN_TEXT;
            } else {
                text.classList.add('comment__text_expanded');
                readMore.textContent = READ_LESS_BTN_TEXT;
            }
        });
    }
}
