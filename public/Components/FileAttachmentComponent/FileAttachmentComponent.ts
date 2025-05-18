import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';


interface FileAttachmentConfig {
    file: File;
    dataUrl: string;
    type: 'file' | 'media';

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
                ...this.config.classes
            ],
            parent: this.parent,
        });
        
        switch (this.config.type) {
            case 'file':
                this.renderFile();
                break;
            case 'media':
                this.renderMedia();
                break;
        }
    }

    private renderMedia() {
        // createElement({
        //     tag: 'img',
        //     parent: this.element,
        //     classes: ['modal__img'],
        // });

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
    
        // const originMedia = this.element.querySelector('img');
        // mediaElement.classList.value = originMedia.classList.value;
        // originMedia.parentElement.appendChild(mediaElement);
        // originMedia.remove();

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
