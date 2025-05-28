import AvatarComponent from "@components/AvatarComponent/AvatarComponent";
import createElement from "@utils/createElement";
import LikeComponent from "../LikeComponent/LikeComponent";
import { CommentsRequests } from "@modules/api";
import { Comment } from "types/PostTypes";
import getTimediff from "@utils/getTimeDifference";
import insertIcon from "@utils/insertIcon";
import ContextMenuComponent from "@components/ContextMenuComponent/ContextMenuComponent";
import LsProfile from "@modules/LsProfile";
import ImageComponent from "@components/UI/ImageComponent/ImageComponent";
import FileAttachmentComponent from "@components/FileAttachmentComponent/FileAttachmentComponent";
import downloadFile from "@utils/downloadFile";
import { VIDEO_EXTENSIONS } from "@config/config";
import VideoComponent from "@components/UI/VideoComponent/VideoComponent";
import PicsViewerComponent from "@components/PicsViewerComponent/PicsViewerComponent";


const ON_ROW_COUNT = 4;


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
    private content: HTMLElement;

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
            href: `/profiles/${this.config.data.author?.username}`,
        });

        this.content = createElement({
            parent: this.element,
            classes: ['comment__content'],
        });

        this.renderHeader();

        if (this.config.data?.media?.length) {
            this.renderMedia();
        }
        if (this.config.data?.files?.length) {
            this.renderFiles();
        }
        if (this.config.data?.stickers?.length) {
            this.renderStickers();
        }

        this.renderText();
    }

    private renderStickers() {
        const stickers = createElement({
            parent: this.content,
            classes: ['msg__stickers'],
        });

        for (const sticker of this.config.data.stickers) {
            new ImageComponent(stickers, {
                src: sticker.url,
                hasSkeleton: true,
                classes: ['msg__sticker'],
            });
        }
    }

    private renderFiles() {
        const files = createElement({
            parent: this.content,
            classes: ['msg__files'],
        });

        for (const file of this.config.data.files) {
            const attachment = new FileAttachmentComponent(files, {
                type: 'file_attached',
                dataUrl: file.url,
                name: file.name,
                classes: ['msg__file'],
            });

            attachment.element.addEventListener('click', async (e) => {
                e.preventDefault();
                await downloadFile(file.url, file.name);
            });
        }
    }

    private renderMedia() {
        const media = createElement({
            parent: this.content,
            classes: ['msg__media']
        });

        const mediaItems: HTMLElement[] = [];
        for (const media of this.config.data.media) {
            const extension = media.url.split('.').pop();

            let mediaItem: HTMLImageElement | HTMLVideoElement;
            if (!VIDEO_EXTENSIONS.includes(extension)) {
                mediaItem = createElement({
                    classes: ['msg__media-item'],
                    attrs: { src: media.url, loading: 'lazy' },
                }) as HTMLImageElement | HTMLVideoElement;
            } else {
                const video = new VideoComponent(mediaItem, {
                    src: media.url,
                    classes: ['msg__media-item'],
                    loop: true,
                    muted: true,
                    autoplay: true,
                    playsInline: true,
                });
                mediaItem = video.element;
            }

            mediaItems.push(mediaItem);
        }

        this.adjustMsgMediaGrid(media, mediaItems);

        media.addEventListener('click', (e) => {
            if (
                !(e.target instanceof HTMLImageElement ||
                e.target instanceof HTMLVideoElement)
            ) {
                return;
            }
            new PicsViewerComponent({
                picsWrapper: media,
                target: e.target,
            });
        });
    }

    private adjustMsgMediaGrid(parent: HTMLElement, items: HTMLElement[]) {
        const total = items.length;
        const fullRowsCount = Math.floor(total / ON_ROW_COUNT);
        const remainder = total % ON_ROW_COUNT;

        for (let i = 0; i < fullRowsCount; i++) {
            const mediaRow = createElement({
                parent,
                classes: ['msg__media-row'],
            });
            mediaRow.style.gridTemplateColumns = `repeat(${ON_ROW_COUNT}, 1fr)`;
            mediaRow.append(
                ...items.slice(i * ON_ROW_COUNT, i * ON_ROW_COUNT + ON_ROW_COUNT)
            );
        }

        if (!remainder) {
            return;
        }

        const lastMediaRow = createElement({
            parent,
            classes: ['msg__media-row'],
        })
    
        lastMediaRow.style.gridTemplateColumns = `repeat(${remainder}, 1fr)`;
        lastMediaRow.append(
            ...items.slice(total - remainder, total)
        );
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
    
    private renderHeader() {
        const header = createElement({
            parent: this.content,
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

    private renderText() {
        if (!this.config?.data?.text) {
            return;
        }

        const textWrapper = createElement({
            parent: this.content,
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
