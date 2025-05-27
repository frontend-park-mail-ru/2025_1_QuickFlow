import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import createElement from '@utils/createElement';
import getTime from '@utils/getTime';
import LsProfile from '@modules/LsProfile';
import PicsViewerComponent from '@components/PicsViewerComponent/PicsViewerComponent';
import FileAttachmentComponent from '@components/FileAttachmentComponent/FileAttachmentComponent';
import downloadFile from '@utils/downloadFile';
import { Message } from 'types/ChatsTypes';
import VideoComponent from '@components/UI/VideoComponent/VideoComponent';
import ImageComponent from '@components/UI/ImageComponent/ImageComponent';
import { VIDEO_EXTENSIONS } from '@config/config';
import ContextMenuComponent, { OptionConfig } from '@components/ContextMenuComponent/ContextMenuComponent';
import copyToClipboard from '@utils/copyToClipboard';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import { ChatsRequests } from '@modules/api';
import DeleteMwComponent from '@components/UI/Modals/DeleteMwComponent';


interface MessageConfig {
    data: Message;
    classes: string[];
    lastReadByMeTime: number;
    lastReadByOtherTime: number;

    parent?: HTMLElement;
    position?: 'top' | 'bottom';
    observer?: IntersectionObserver;
}


const MSG_AVATAR_SIZE = 'xs';
const ON_ROW_COUNT = 3;


export default class MessageComponent {
    private config: MessageConfig;

    public element: HTMLElement;
    private content: HTMLElement;

    constructor(config: MessageConfig) {
        this.config = config;
        this.render();
    }

    render() {
        this.element = this.renderMsg();

        this.renderContextMenu();

        switch (this.config?.position) {
            case 'top':
                this.config.parent.prepend(this.element);
                break;
            case 'bottom':
                this.config.parent.append(this.element);
                break;
        }
    }

    private renderContextMenu() {
        const data: Record<string, OptionConfig> = {};

        if (this.config?.data?.text) {
            data.copy = {
                icon: 'copy-icon',
                text: 'Скопировать текст',
                onClick: () => copyToClipboard(
                    this.config.data.text,
                    () => {
                        new PopUpComponent({
                            text: 'Текст скопирован в буфер обмена',
                            icon: "copy-icon",
                        });
                    }
                ),
            }
        }

        if (this.config?.data?.sender?.id === LsProfile.id) {
            data.delete = {
                icon: 'trash-accent-icon',
                text: 'Удалить',
                isCritical: true,
                onClick: () => this.onDeleteMessageClick(),
            }
        }

        if (!Object.keys(data).length) {
            return;
        }

        new ContextMenuComponent(this.element, {
            data,
            listenersTypes: ['contextmenu'],
            classes: 'msg__context-menu',
            onVisibilityToggle: (isVisible) => this.toggleSelection(isVisible),
        });
    }

    private toggleSelection(isVisible: boolean) {
        if (isVisible) {
            this.element.classList.add('msg_selected');
        } else {
            this.element.classList.remove('msg_selected');
        }
    }

    private onDeleteMessageClick() {
        const main = document.querySelector('.main') as HTMLElement;
        main.style.position = '';
        const parent = main.querySelector('.container_messenger') as HTMLElement;
        
        new DeleteMwComponent(parent, {
            data: {
                title: 'Вы уверены, что хотите удалить сообщение?',
                text: 'Сообщение удалится у обоих, это действие нельзя будет отменить',
                cancel: 'Отменить',
                confirm: 'Удалить',
            },
            delete: () => {
                ChatsRequests.deleteMessage(this.config.data.id);
                main.style.position = 'fixed';
            },
            cancel: () => main.style.position = 'fixed',
        });
    }

    private renderMsg(): HTMLElement {
        const msgData = this.config.data;

        const isMine = msgData.sender.username === LsProfile.username;
        const msgTime = new Date(msgData.created_at).getTime();

        const msg = createElement({
            classes: ['chat__msg', ...this.config.classes],
            attrs: {
                'data-msg-id': msgData.id.toString(),
                'data-msg-ts': msgData.created_at,
                'data-msg-from': msgData.sender.username,
            },
        });

        if (!isMine && msgTime > this.config.lastReadByMeTime) {
            this.config.observer.observe(msg);
        }

        new AvatarComponent(msg, {
            size: MSG_AVATAR_SIZE,
            src: msgData.sender?.avatar_url || '',
            href: `/profiles/${msgData.sender?.username}`
        });

        this.content = createElement({
            parent: msg,
            classes: ['chat__msg-content'],
        });

        createElement({
            parent: this.content,
            classes: ['chat__sender'],
            text: `${msgData.sender.firstname} ${msgData.sender.lastname}`
        });

        if (this.config.data?.media?.length) {
            this.renderMedia();
        }
        if (this.config.data?.files?.length) {
            this.renderFiles();
        }
        if (this.config.data?.stickers?.length) {
            this.renderStickers();
        }

        createElement({
            parent: this.content,
            text: msgData.text,
        });

        const msgInfo = createElement({
            parent: msg,
            classes: ['chat__msg-info'],
        });

        if (isMine) {
            createElement({
                parent: msgInfo,
                classes: [
                    'chat__msg-status',
                    msgTime <= this.config.lastReadByOtherTime ? 'chat__msg-status_read' : 'chat__msg-status_unread'
                ],
            });
        }

        createElement({
            parent: msgInfo,
            classes: ['chat__msg-ts'],
            text: getTime(msgData.created_at),
        });

        return msg;
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
}
