import ContextMenuComponent from '@components/ContextMenuComponent/ContextMenuComponent';
import createElement from '@utils/createElement';
import { FILE, MEDIA, MSG, UPLOAD_DATA } from '@config/config';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';


const MEDIA_CONTEXT_MENU_DATA = {
    photo: {
        text: 'Медиа',
        icon: 'primary-photo-icon',
        href: 'media',
    },
    file: {
        text: 'Файл',
        icon: 'file-icon',
        href: 'file',
    },
};


interface AttachmentsDropdownConfig {
    attachments: HTMLElement;
    handleMediaUpload: () => void;
    renderFilePreview: (file: File, dataUrl: string) => HTMLElement;
    renderMediaPreview: (file: File, dataUrl: string) => HTMLElement;
}


export default class AttachmentsDropdownComponent {
    private parent: HTMLElement | null = null;
    private config: AttachmentsDropdownConfig;
    
    private element: HTMLElement | null = null;
    public mediaInput: FileInputComponent | null = null;
    public filesInput: FileInputComponent | null = null;

    constructor(parent: HTMLElement, config: AttachmentsDropdownConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        this.element = createElement({
            parent: this.parent,
            classes: ['dropdown', 'msg-bar__dropdown'],
        });

        const contextMenu = new ContextMenuComponent(this.element, {
            data: MEDIA_CONTEXT_MENU_DATA,
            size: 'mini',
            position: 'above-start',
        });

        createElement({
            classes: ['msg-bar__add-media'],
            parent: this.element,
        });

        this.mediaInput = new FileInputComponent(this.config.attachments, {
            imitator: contextMenu.getItem('media'),
            renderPreview: this.config.renderMediaPreview,
            accept: MEDIA.ACCEPT,
            id: 'message-media-upload',
            insertPosition: 'end',
            multiple: true,
            required: true,
            maxCount: MSG.IMG_MAX_COUNT,
            compress: true,
            maxResolution: MEDIA.IMG_MAX_RES,
            maxSize: UPLOAD_DATA.MAX_SIZE,
            maxSizeSingle: UPLOAD_DATA.MAX_SINGLE_SIZE,
        });

        this.filesInput = new FileInputComponent(this.config.attachments, {
            imitator: contextMenu.getItem('file'),
            renderPreview: this.config.renderFilePreview,
            accept: FILE.ACCEPT,
            id: 'message-file-upload',
            insertPosition: 'end',
            multiple: true,
            required: true,
            maxCount: MSG.FILE_MAX_COUNT,
            maxSize: UPLOAD_DATA.MAX_SIZE,
            maxSizeSingle: UPLOAD_DATA.MAX_SINGLE_SIZE,
        });

        this.mediaInput.addListener(this.config.handleMediaUpload);
        this.filesInput.addListener(this.config.handleMediaUpload);
    }
}
