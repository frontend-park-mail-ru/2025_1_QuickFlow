import AvatarComponent from "@components/AvatarComponent/AvatarComponent";
import LsProfile from "@modules/LsProfile";
import createElement from "@utils/createElement";
import insertIcon from "@utils/insertIcon";
import { CommentsRequests, PostsRequests } from "@modules/api";
import TextareaComponent from "@components/UI/TextareaComponent/TextareaComponent";
import { Comment, CommentRequest } from "types/PostTypes";
import CommentComponent from "../CommentComponent/CommentComponent";
import Router from "@router";
import networkErrorPopUp from "@utils/networkErrorPopUp";
import EmojiBarComponent from "@components/Messenger/MessageBar/EmojiBarComponent/EmojiBarComponent";
import insertSym from "@utils/insertSym";


interface CommentsConfig {
    lastData: Comment;
    postId: string;
    commentsCount: number;
}


const COMMENT_MAX_LENGTH = 2000;
const SHOW_NEXT_COMMENTS = 'Показать следующие комментарии';
const SHOW_OTHER_COMMENTS = 'Показать другие комментарии';
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
    private totalFetchedCount: number = 0;

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
        this.totalFetchedCount++;

        if (this.config.commentsCount === this.totalFetchedCount) {
            return;
        }

        this.showMoreBtn = createElement({
            parent: this.wrapper,
            classes: ['comments__more'],
            text: SHOW_OTHER_COMMENTS,
        });   

        this.showMoreBtn.addEventListener('click', () => this.fetchComment());
    }

    private async fetchComment() {
        let status: number, commentsData: Comment[];
        if (this.lastTs) {
            [status, commentsData] = await CommentsRequests.getComments(this.config.postId, COMMENTS_FETCH_COUNT, this.lastTs);
        } else {
            [status, commentsData] = await CommentsRequests.getComments(this.config.postId, COMMENTS_FETCH_COUNT);
        }
        
        switch (status) {
            case 200:
                this.renderFetchedComments(commentsData);
                break;
            case 401:
                Router.go({ path: '/login' });
                return;
            default:
                networkErrorPopUp();
                return;
        }
    }

    private renderFetchedComments(commentsData: Comment[]) {
        if (!commentsData) {
            this.showMoreBtn.remove();
            return;
        }

        if (!this.lastTs) {
            this.element?.lastChild?.remove();
        }

        for (const commentData of commentsData) {
            // if (commentData.id === this.config.lastData.id) {
            //     continue;
            // }
            this.renderComment(commentData);
            this.lastTs = commentData.created_at;
            this.totalFetchedCount++;
        }

        if (
            commentsData.length < COMMENTS_FETCH_COUNT ||
            this.totalFetchedCount >= this.config.commentsCount
        ) {
            this.showMoreBtn.remove();
        }

        this.showMoreBtn.innerText = SHOW_NEXT_COMMENTS;
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

        const textareaWrapper = createElement({
            parent: bar,
            classes: ['comments__textarea-wrapper'],
        });

        this.textarea = new TextareaComponent(textareaWrapper, {
            placeholder: BAR_PLACEHOLDER,
            name: 'comment',
            maxLength: COMMENT_MAX_LENGTH,
            textareaClasses: ['comments__textarea'],
            attrs: { rows: 1 },
        });
        this.textarea.addListener(this.handleInput.bind(this));

        new EmojiBarComponent(textareaWrapper, {
            addToMessage: this.addEmoji.bind(this),
            sendSticker: this.sendSticker.bind(this),
        });

        this.sendBtn = await insertIcon(bar, {
            name: 'plane-icon',
            classes: ['comments__send-icon', 'comments__send-icon_disabled'],
        });
        this.sendBtn.addEventListener('click', this.sendComment.bind(this));
    }

    private addEmoji(emoji: string) {
        insertSym(this.textarea.textarea, emoji, {
            maxLength: COMMENT_MAX_LENGTH,
        });
    }

    private sendSticker() {
        console.log('Sticker is sent');
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
                this.updateActionCounter();
                break;
            case 401:
                Router.go({ path: '/login' });
                return;
        }
    }

    private updateActionCounter() {
        const counter = this.parent.querySelector('.js-post-action-counter-comment');
        if (!counter) {
            return;
        }
        counter.textContent = `${+counter.textContent + 1}`;
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

    private renderComment(commentData: Comment) {
        if (!this.element) {
            this.element = createElement({
                classes: ['comments'],
            });
            this.wrapper.prepend(this.element);
        }

        new CommentComponent(this.element, { data: commentData });
    }
}
