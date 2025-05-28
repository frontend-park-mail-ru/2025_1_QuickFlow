import AudioPlayerComponent from '@components/AudioPlayerComponent/AudioPlayerComponent';
import { AUDIO_EXTENSIONS } from '@config/config';
import createElement from '@utils/createElement';
import getFileSizeFromUrl from '@utils/getFileSizeFromUrl';
import insertIcon from '@utils/insertIcon';


interface FileAttachmentConfig {
    dataUrl: string;
    type: 'file' | 'media' | 'file_attached';
    
    file?: File;
    name?: string;
    classes?: string[];
}


export default class FileAttachmentComponent {
    private parent: HTMLElement | null = null;
    private config: FileAttachmentConfig;

    public element: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: FileAttachmentConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        this.element = createElement({
            classes: [
                'attachment',
                `attachment_${this.config.type}`,
            ],
            parent: this.parent,
        });

        if (this.config.classes.length) {
            this.element.classList.add(...this.config.classes);
        }
        
        switch (this.config.type) {
            case 'file':
                this.renderFile();
                break;
            case 'file_attached':
                this.renderAttachedFile();
                break;
            case 'media':
                this.renderMedia();
                break;
        }
    }

    private async renderAttachedFile() {
        const extension = this.config?.dataUrl?.split('.')?.pop() || '';

        if (AUDIO_EXTENSIONS.includes(extension)) {
            new AudioPlayerComponent(this.parent, {
                src: this.config.dataUrl,
                name: this.config?.name,
                classes: ['attachment__audio'],
            });
            this.element.remove();
            return;
        }

        const iconWrapper = createElement({
            parent: this.element,
            classes: ['attachment__icon-wrapper'],
        });

        insertIcon(iconWrapper, {
            name: 'file-icon',
            classes: ['attachment__icon'],
        });

        const infoWrapper = createElement({
            parent: this.element,
            classes: ['attachment__info'],
        });

        const filename = this.config?.name || this.config.dataUrl.split('/').pop();
        createElement({
            parent: infoWrapper,
            text: filename,
            classes: ['attachment__name'],
        });

        createElement({
            parent: infoWrapper,
            text: `${Math.round(await getFileSizeFromUrl(this.config.dataUrl) / 1024)}KB`,
            classes: ['attachment__size'],
        });
    }

    private renderMedia() {
        const isVideo = this.config.file.type.startsWith('video/');
            
        const mediaElement = createElement({
            tag: isVideo ? 'video' : 'img',
            parent: this.element,
            classes: ['modal__img'],
        }) as HTMLVideoElement | HTMLImageElement;
    
        if (mediaElement instanceof HTMLVideoElement) {
            mediaElement.src = this.config.dataUrl;
            mediaElement.loop = true;
            mediaElement.muted = true;

            mediaElement.addEventListener('loadeddata', () => {
                mediaElement.play();
            });

            mediaElement.load();
        } else {
            mediaElement.src = this.config.dataUrl;
        }

        if (mediaElement instanceof HTMLVideoElement) {
            mediaElement.addEventListener('loadedmetadata', () => {
                const timing = createElement({
                    parent: this.element,
                    classes: ["attachment__timing"],
                });
    
                insertIcon(timing, {
                    name: 'play-icon',
                    classes: ['attachment__timing-icon'],
                });
    
                const duration = Math.round(mediaElement.duration);
                createElement({
                    parent: timing,
                    text: `0:${duration > 9 ? duration : `0${duration}`}`,
                });
            });
        }

        const overlay = createElement({
            parent: this.element,
            classes: [
                "modal__pic-overlay",
                "js-post-pic-delete",
            ],
        });

        createElement({
            parent: overlay,
            classes: ["modal__pic-delete"],
        });
    }

    private renderFile() {
        const iconWrapper = createElement({
            parent: this.element,
            classes: ['attachment__icon-wrapper'],
        });

        insertIcon(iconWrapper, {
            name: 'file-icon',
            classes: ['attachment__icon'],
        });

        const infoWrapper = createElement({
            parent: this.element,
            classes: ['attachment__info'],
        });

        createElement({
            parent: infoWrapper,
            text: this.config.file.name,
            classes: ['attachment__name'],
        });

        createElement({
            parent: infoWrapper,
            text: `${Math.round(this.config.file.size / 1024)}KB`,
            classes: ['attachment__size'],
        });

        insertIcon(iconWrapper, {
            name: 'trash-white-icon',
            classes: ['attachment__icon_delete'],
        });
    }
}
