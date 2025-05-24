import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import createElement from '@utils/createElement';
import getTime from '@utils/getTime';
import LsProfile from '@modules/LsProfile';
import PicsViewerComponent from '@components/PicsViewerComponent/PicsViewerComponent';
import FileAttachmentComponent from '@components/FileAttachmentComponent/FileAttachmentComponent';
import downloadFile from '@utils/downloadFile';


interface MessageConfig {
    data: Record<string, any>;
    classes: string[];
    lastReadByMeTime: number;
    lastReadByOtherTime: number;

    parent?: HTMLElement;
    position?: 'top' | 'bottom';
    observer?: IntersectionObserver;
}


const MSG_AVATAR_SIZE = 'xs';
const ON_ROW_COUNT = 4;


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

        switch (this.config?.position) {
            case 'top':
                this.config.parent.prepend(this.element);
                break;
            case 'bottom':
                this.config.parent.append(this.element);
                break;
        }
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

    private renderFiles() {
        const files = createElement({
            parent: this.content,
            classes: ['msg__files'],
        });

        for (const fileUrl of this.config.data.files) {
            const attachment = new FileAttachmentComponent(files, {
                type: 'file_attached',
                dataUrl: fileUrl,
                classes: ['msg__file'],
            });

            attachment.element.addEventListener('click', async (e) => {
                e.preventDefault();
                await downloadFile(fileUrl);
            });
        }
    }

    private renderMedia() {
        const media = createElement({
            parent: this.content,
            classes: ['msg__media']
        });

        const mediaItems: HTMLElement[] = [];
        for (const mediaUrl of this.config.data.media) {
            const extension = mediaUrl.split('.').at(-1);

            const mediaItem = createElement({
                tag: extension === 'mp4' ? 'video' : 'img',
                classes: ['msg__media-item'],
                attrs: {
                    src: mediaUrl,
                },
            }) as HTMLImageElement | HTMLVideoElement;

            if (mediaItem instanceof HTMLVideoElement) {
                mediaItem.loop = true;
                mediaItem.muted = true;

                mediaItem.addEventListener('loadeddata', () => {
                    mediaItem.play();
                });

                mediaItem.load();
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
