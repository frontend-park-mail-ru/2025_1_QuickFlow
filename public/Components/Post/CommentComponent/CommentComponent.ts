import AvatarComponent from "@components/AvatarComponent/AvatarComponent";
import createElement from "@utils/createElement";
import LikeComponent from "../LikeComponent/LikeComponent";
import { CommentsRequests } from "@modules/api";
import { Comment } from "types/PostTypes";
import formatTimeAgo from "@utils/formatTimeAgo";
import getTimediff from "@utils/getTimeDifference";
import insertIcon from "@utils/insertIcon";
import ContextMenuComponent from "@components/ContextMenuComponent/ContextMenuComponent";
import LsProfile from "@modules/LsProfile";


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

    private divider: HTMLElement;
    public element: HTMLElement;

    constructor(parent: HTMLElement, config: CommentConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        this.renderDivider();

        this.element = createElement({
            parent: this.parent,
            classes: ['comment'],
        });

        new AvatarComponent(this.element, {
            src: this.config.data.author?.avatar_url,
            size: AVATAR_SIZE,
        });

        const content = createElement({
            parent: this.element,
            classes: ['comment__content'],
        });

        this.renderHeader(content);
        this.renderText(content);
    }

    private renderDivider() {
        if (this.parent?.lastElementChild?.classList?.contains('comments__divider')) {
            return;
        }

        this.divider = createElement({
            parent: this.parent,
            classes: [
                'comments__divider',
                this.parent.innerHTML !== '' ? 
                    'comments__divider_small' :
                    'comments__divider'
            ],
        });
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
            text: getTimediff(this.config.data.created_at, { mode: 'short' }),
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
            removeMethod: CommentsRequests.removeLike,
        });

        this.renderDropdown(actions);
    }

    private renderDropdown(parent: HTMLElement) {
        if (this.config.data.author.id !== LsProfile.id) {
            return;
        }

        const dropdown = createElement({
            parent,
            classes: [
                'comment__action',
                'dropdown',
                'comment__dropdown'
            ],
        });

        insertIcon(dropdown, {
            name: 'options-icon',
            classes: ['comment__action-icon'],
        });

        new ContextMenuComponent(dropdown, {
            size: 'mini',
            data: {
                delete: {
                    icon: 'trash-accent-icon',
                    text: 'Удалить',
                    isCritical: true,
                    onClick: () => this.delete(),
                },
            },
        });
    }

    private updateActionCounter() {
        const counter = this.parent
            .closest('.post')
            .querySelector('.js-post-action-counter-comment');

        if (!counter) {
            return;
        }
        counter.textContent = `${+counter.textContent - 1}`;
    }

    private async delete() {
        const status = await CommentsRequests.deleteComment(this.config.data.id);

        switch (status) {
            case 200:
                this?.divider?.remove();
                this.element.remove();
                this.updateActionCounter();
                break;
        }
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
