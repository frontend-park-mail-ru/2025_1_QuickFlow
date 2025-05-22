import AvatarComponent from "@components/AvatarComponent/AvatarComponent";
import LsProfile from "@modules/LsProfile";
import createElement from "@utils/createElement";
import insertIcon from "@utils/insertIcon";
import LikeComponent from "../LikeComponent/LikeComponent";
import { PostsRequests } from "@modules/api";
import TextareaComponent from "@components/UI/TextareaComponent/TextareaComponent";


interface CommentsConfig {
    
}

const COMMENT_MAX_LENGTH = 2000;
const DIVIDER_SYMBOL = '•';
const READ_MORE_BTN_TEXT = 'Показать ещё';
const READ_LESS_BTN_TEXT = 'Скрыть';
const SHOW_NEXT_COMMENTS = 'Показать следующие комментарии';
const EXTRA_FIX_PX = 2;


export default class CommentsComponent {
    private parent: HTMLElement;
    private config: CommentsConfig;

    public element: HTMLElement;
    private wrapper: HTMLElement;
    private textarea: TextareaComponent | null = null;
    private sendBtn: HTMLElement;

    constructor(parent: HTMLElement, config: CommentsConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        this.wrapper = createElement({
            parent: this.parent,
            classes: ['comments__wrapper'],
        });

        createElement({
            parent: this.wrapper,
            classes: ['comments__divider'],
        });

        this.element = createElement({
            parent: this.wrapper,
            classes: ['comments'],
        });

        this.renderComment();

        createElement({
            parent: this.wrapper,
            classes: ['comments__more'],
            text: SHOW_NEXT_COMMENTS,
        })
        .addEventListener('click', () => {
            this.renderComment();
        });

        this.renderCommentBar();
    }

    private async renderCommentBar() {
        const bar = createElement({
            parent: this.wrapper,
            classes: ['comments__bar'],
        });

        new AvatarComponent(bar, {
            src: LsProfile.data.profile.avatar_url,
            size: 'xxs',
            class: 'comments__bar-avatar',
        });

        this.textarea = new TextareaComponent(bar, {
            placeholder: 'Добавить комментарий...',
            name: 'comment',
            maxLength: COMMENT_MAX_LENGTH,
            textareaClasses: ['comments__textarea'],
            attrs: { rows: 1 },
        });
        this.textarea.addListener(this.handleInput.bind(this));

        this.sendBtn = await insertIcon(bar, {
            name: 'plane-icon',
            classes: ['comments__send-icon', 'comments__send-icon_disabled'],
        });
        this.sendBtn.addEventListener('click', this.sendComment.bind(this));
    }

    private async sendComment() {
        if (this.textarea?.isValid()) {
            // const status = await CommentsRequests.createComment(this.textarea.textarea.value);
            const status = 200;

            switch (status) {
                case 200:
                    this.renderComment();
                    break;
            }

            this.textarea.textarea.value = '';
        }
    }

    private handleInput() {
        if (this.textarea.isEmpty()) {
            this.sendBtn.classList.add('comments__send-icon_disabled');
        } else {
            this.sendBtn.classList.remove('comments__send-icon_disabled');
        }

        const el = this.textarea.textarea;
        el.style.height = 'auto';
        el.style.height = `${this.textarea.textarea.scrollHeight + EXTRA_FIX_PX}px`;
    }

    private renderComment() {
        if (this.element.innerHTML !== '') {
            createElement({
                parent: this.element,
                classes: ['comments__divider', 'comments__divider_small'],
            });
        }

        const comment = createElement({
            parent: this.element,
            classes: ['comment'],
        });

        new AvatarComponent(comment, {
            src: LsProfile.data.profile.avatar_url,
            size: 'xxs',
        });

        const content = createElement({
            parent: comment,
            classes: ['comment__content'],
        });

        this.renderHeader(content);
        this.renderText(content);
    }

    private renderText(parent: HTMLElement) {
        const textWrapper = createElement({
            parent,
            classes: ['comment__text-wrapper'],
        });
    
        const text = createElement({
            parent: textWrapper,
            classes: ['comment__text'],
            text: 'Ваау! Не перестаю восхищаться природой этой страны) Ваау! Не перестаю восхищаться природой этой страны) Ваау! Не перестаю восхищаться природой этой страны)',
        });
    

        const readMore = createElement({
            tag: 'p',
            parent: textWrapper,
            classes: ['comment__more'],
            text: READ_MORE_BTN_TEXT,
            attrs: { style: 'display: none;' }
        });

        // После рендеринга проверяем, обрезается ли текст
        requestAnimationFrame(() => {
            if (text.scrollHeight > text.clientHeight) {
                readMore.style.display = 'inline-block';
            }
        });

        // Добавляем обработчик клика для разворачивания и сворачивания текста
        readMore.addEventListener('click', () => {
            if (text.classList.contains('comment__text_expanded')) {
                text.classList.remove('comment__text_expanded');
                readMore.textContent = READ_MORE_BTN_TEXT;
                // readMore.style.position = 'absolute';
            } else {
                text.classList.add('comment__text_expanded');
                readMore.textContent = READ_LESS_BTN_TEXT;
                // readMore.style.position = 'static';
            }
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
            text: 'Roman Vasyutenko',
        });

        createElement({
            parent: headerInfo,
            classes: ['comment__time'],
            text: DIVIDER_SYMBOL,
        });

        createElement({
            parent: headerInfo,
            classes: ['comment__time'],
            text: '22мин',
        });

        const actions = createElement({
            parent: header,
            classes: ['comment__actions'],
        });

        const replyAction = createElement({
            parent: actions,
            classes: ['comment__action'],
        });

        insertIcon(replyAction, {
            name: 'reply-icon',
            classes: ['comment__action-icon'],
        });

        createElement({
            parent: replyAction,
            text: 'Ответить',
        });

        new LikeComponent(actions, {
            isLiked: false,
            targetId: 'this.config.id',
            likeCount: 12,
            classes: ['comment__action'],
            putMethod: PostsRequests.putLike,
            removeMethod: PostsRequests.removeLike,
        });
    }
}
