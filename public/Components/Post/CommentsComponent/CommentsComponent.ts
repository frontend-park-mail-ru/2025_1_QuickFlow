import AvatarComponent from "@components/AvatarComponent/AvatarComponent";
import LsProfile from "@modules/LsProfile";
import createElement from "@utils/createElement";
import insertIcon from "@utils/insertIcon";
import { CommentsRequests, FilesRequests } from "@modules/api";
import TextareaComponent from "@components/UI/TextareaComponent/TextareaComponent";
import { Comment, CommentRequest } from "types/PostTypes";
import CommentComponent from "../CommentComponent/CommentComponent";
import Router from "@router";
import networkErrorPopUp from "@utils/networkErrorPopUp";
import EmojiBarComponent from "@components/Messenger/MessageBar/EmojiBarComponent/EmojiBarComponent";
import insertSym from "@utils/insertSym";
import AttachmentsDropdownComponent from "@components/AttachmentsDropdownComponent/AttachmentsDropdownComponent";
import FileAttachmentComponent from "@components/FileAttachmentComponent/FileAttachmentComponent";
import validateUploadData from "@utils/validateUploadData";
import { UploadData, UploadRequest } from "types/UploadTypes";


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
    private observer: MutationObserver | null = null;

    private attachments: HTMLElement;
    private attachmentsDropdown: AttachmentsDropdownComponent | null = null;

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
        if (this.showMoreBtn.classList.contains('disabled')) {
            return;
        }

        this.showMoreBtn.classList.add('disabled');

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
                break;
        }

        this.showMoreBtn.classList.remove('disabled');
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
        const barWrapper = createElement({
            parent: this.wrapper,
            classes: ['comments__bar-wrapper'],
        });

        this.attachments = createElement({
            classes: ['comments__attachments', 'hidden'],
            parent: barWrapper,
        });

        const bar = createElement({
            parent: barWrapper,
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

        this.attachmentsDropdown = new AttachmentsDropdownComponent(textareaWrapper, {
            attachments: this.attachments,
            handleMediaUpload: this.handleMediaUpload.bind(this),
            renderFilePreview: this.renderFilePreview.bind(this),
            renderMediaPreview: this.renderMediaPreview.bind(this),
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

        this.sendBtn.addEventListener('click', () => {
            this.updateSendBtnState();
            if (this.sendBtn.classList.contains('comments__send-icon_disabled')) {
                return;
            }
            this.sendComment();
        });
    }

    private handleMediaUpload() {
        const mediaCount = this.attachmentsDropdown.mediaInput?.getFiles().length || 0;
        const filesCount = this.attachmentsDropdown.filesInput?.getFiles().length || 0;

        if (!mediaCount && !filesCount) {
            this.attachments.classList.add('hidden');
        } else {
            this.attachments.classList.remove('hidden');
        }

        this.updateSendBtnState();
    }

    private renderMediaPreview(file: File, dataUrl: string): HTMLElement {
        const attachment = new FileAttachmentComponent(this.attachments, {
            type: 'media',
            file,
            dataUrl,
            classes: ['msg-bar__attachment'],
        });

        attachment.element.addEventListener('click', () => {
            this.attachmentsDropdown.mediaInput.removeFile(file, attachment.element);
        });

        return attachment.element;
    }

    private renderFilePreview(file: File, dataUrl: string): HTMLElement {
        const attachment = new FileAttachmentComponent(this.attachments, {
            type: 'file',
            file,
            dataUrl,
            classes: ['msg-bar__attachment_file'],
        });

        attachment.element.addEventListener('click', () => {
            this.attachmentsDropdown.filesInput.removeFile(file, attachment.element);
        });

        return attachment.element;
    }

    private addEmoji(emoji: string) {
        insertSym(this.textarea.textarea, emoji, {
            maxLength: COMMENT_MAX_LENGTH,
        });
    }

    private sendSticker(stickerUrl: string) {
        this.sendComment(stickerUrl);
    }

    private async sendComment(stickerUrl?: string) {
        const body: CommentRequest = {};

        body.text = this?.textarea?.value || '';

        if (!stickerUrl) {
            if (
                this.attachmentsDropdown.mediaInput?.input?.files?.length > 0 ||
                this.attachmentsDropdown.filesInput?.input?.files?.length > 0
            ) {
                if (
                    !validateUploadData({
                        mediaInputs: [this.attachmentsDropdown.mediaInput],
                        filesInputs: [this.attachmentsDropdown.filesInput],
                    })
                ) {
                    return;
                }
    
                const dataToUpload: UploadRequest = {
                    media: this.attachmentsDropdown.mediaInput.input.files,
                    files: this.attachmentsDropdown.filesInput.input.files,
                };
    
                const [status, mediaData]: [number, UploadData] = await FilesRequests.upload(dataToUpload);
                switch (status) {
                    case 200:
                        break;
                    default:
                        networkErrorPopUp({ text: 'Не удалось загрузить вложения, попробуйте позже' });
                        return;
                }
    
                if (mediaData?.payload?.media) {
                    body.media = mediaData.payload.media;
                }
                if (mediaData?.payload?.files) {
                    body.files = mediaData.payload.files;
                }
                if (mediaData?.payload?.audio) {
                    body.audio = mediaData.payload.audio;
                }
    
                this.attachmentsDropdown.mediaInput.clear();
                this.attachmentsDropdown.filesInput.clear();
                this.attachments.innerHTML = '';
            }
        } else {
            body.stickers = [stickerUrl];
        }

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
        this.updateSendBtnState();
        // if (this.textarea.isEmpty()) {
        //     this.sendBtn.classList.add('comments__send-icon_disabled');
        // } else {
        //     this.sendBtn.classList.remove('comments__send-icon_disabled');
        // }

        const el = this.textarea.textarea;
        el.style.height = 'auto';
        el.style.height = `${this.textarea.textarea.scrollHeight + EXTRA_FIX_PX}px`;
    }

    private updateSendBtnState() {
        if (
            this.textarea.isEmpty() &&
            !this.attachmentsDropdown.mediaInput.isValid() &&
            !this.attachmentsDropdown.filesInput.isValid()
        ) {
            return this.sendBtn.classList.add('comments__send-icon_disabled');
        }

        this.sendBtn.classList.remove('comments__send-icon_disabled');
    }

    private renderComment(commentData: Comment) {
        if (!this.element) {
            this.element = createElement({
                classes: ['comments'],
            });
            this.wrapper.prepend(this.element);
            this.initObserver();
        }

        new CommentComponent(this.element, { data: commentData });
    }

    private initObserver() {
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    this.onCommentsChanged();
                }
            }
        });
    
        this.observer.observe(this.element, {
            childList: true,
            subtree: false,
        });
    }

    private onCommentsChanged() {
        const children = this?.element?.children;

        if (!children?.length) {
            return;
        }

        if (children?.length < 2) {
            this?.element?.remove();
            this.element = null;
            return;
        }

        children[0].classList?.remove('comments__divider_small');

        if (
            children[0]?.classList?.contains('comments__divider') &&
            children[1]?.classList?.contains('comments__divider')
        ) {
            children[1]?.remove();
        }
    }    
}
