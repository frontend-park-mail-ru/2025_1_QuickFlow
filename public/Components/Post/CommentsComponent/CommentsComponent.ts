import AvatarComponent from "@components/AvatarComponent/AvatarComponent";
import LsProfile from "@modules/LsProfile";
import createElement from "@utils/createElement";
import insertIcon from "@utils/insertIcon";
import LikeComponent from "../LikeComponent/LikeComponent";
import { CommentsRequests, PostsRequests } from "@modules/api";
import TextareaComponent from "@components/UI/TextareaComponent/TextareaComponent";
import { Comment, CommentRequest } from "types/PostTypes";
import CommentComponent from "../CommentComponent/CommentComponent";
import Router from "@router";
import PopUpComponent from "@components/UI/PopUpComponent/PopUpComponent";


interface CommentsConfig {
    lastData: Comment;
    postId: string;
}


const COMMENT_MAX_LENGTH = 2000;
const SHOW_NEXT_COMMENTS = 'Показать следующие комментарии';
const EXTRA_FIX_PX = 2;
const COMMENTS_FETCH_COUNT = 3;
const BAR_AVATAR_SIZE = 'xxs';
const BAR_PLACEHOLDER = 'Добавить комментарий...';


export default class CommentsComponent {
    private parent: HTMLElement;
    private config: CommentsConfig;

    public element: HTMLElement;
    private wrapper: HTMLElement;
    private textarea: TextareaComponent | null = null;
    private lastTs: string | null = null;
    private sendBtn: HTMLElement;
    private showMoreBtn: HTMLElement | null = null;

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

        this.renderLastComment();
        this.renderTextareaBar();
    }

    private renderLastComment() {
        if (!this.config.lastData) {
            return;
        }

        this.renderComment(this.config.lastData);

        this.showMoreBtn = createElement({
            parent: this.wrapper,
            classes: ['comments__more'],
            text: SHOW_NEXT_COMMENTS,
        });

        this.showMoreBtn.addEventListener('click', () => this.fetchComment());
    }

    private async fetchComment() {
        const [status, commentsData] = await CommentsRequests.getComments(this.config.postId, COMMENTS_FETCH_COUNT, this.lastTs);

        switch (status) {
            case 200:
                this.renderFetchedComments(commentsData);
                break;
            case 401:
                Router.go({ path: '/login' });
                return;
            default:
                this.renderNetworkErrorPopUp();
                return;
        }
    }

    private renderFetchedComments(commentsData: Comment[]) {
        if (
            !commentsData ||
            commentsData.length < COMMENTS_FETCH_COUNT
        ) {
            this.showMoreBtn.remove();
        }

        for (const commentData of commentsData) {
            this.renderComment(commentData);   
        }
    }

    private renderNetworkErrorPopUp() {
        new PopUpComponent({
            icon: 'close-icon',
            size: 'large',
            text: 'Проверьте подключение к интернету',
            isError: true,
        });
    }

    private async renderTextareaBar() {
        const bar = createElement({
            parent: this.wrapper,
            classes: ['comments__bar'],
        });

        new AvatarComponent(bar, {
            src: LsProfile.data.profile.avatar_url,
            size: BAR_AVATAR_SIZE,
            class: 'comments__bar-avatar',
        });

        this.textarea = new TextareaComponent(bar, {
            placeholder: BAR_PLACEHOLDER,
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
        if (!this.textarea?.isValid()) {
            return;
        }

        const body: CommentRequest = {
            text: this.textarea.value,
        };

        const [status, commentData] = await CommentsRequests.createComment(this.config.postId, body);
        switch (status) {
            case 200:
                this.renderComment(commentData);
                this.clearTextarea();
                break;
            case 401:
                Router.go({ path: '/login' });
                return;
        }
    }

    private clearTextarea() {
        if (this.textarea) {
            this.textarea.textarea.value = '';
            this.handleInput();
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

    // private async fetchComments() {
    //     const [status, commentsData] = await PostsRequests.getComments();
    // }

    private renderComment(commentData: Comment) {
        if (!this.element) {
            this.element = createElement({
                classes: ['comments'],
            });
            this.wrapper.prepend(this.element);

            this.wrapper.prepend(createElement({
                classes: ['comments__divider'],
            }));
        }

        new CommentComponent(this.element, { data: commentData });
        this.lastTs = commentData.created_at;
    }
}
