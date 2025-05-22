import AvatarComponent from "@components/AvatarComponent/AvatarComponent";
import LsProfile from "@modules/LsProfile";
import createElement from "@utils/createElement";
import insertIcon from "@utils/insertIcon";
import LikeComponent from "../LikeComponent/LikeComponent";
import { PostsRequests } from "@modules/api";
import TextareaComponent from "@components/UI/TextareaComponent/TextareaComponent";


interface CommentConfig {
    text: string;
    ts: string;
    author: Record<string, any>;
    like_count: number;
    is_liked: boolean;
    id: string;
}


const DIVIDER_SYMBOL = '•';
const READ_MORE_BTN_TEXT = 'Показать ещё';
const READ_LESS_BTN_TEXT = 'Скрыть';


export default class CommentComponent {
    private parent: HTMLElement;
    private config: CommentConfig;

    public element: HTMLElement;
    private wrapper: HTMLElement;
    private textarea: TextareaComponent | null = null;
    private sendBtn: HTMLElement;

    constructor(parent: HTMLElement, config: CommentConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
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
