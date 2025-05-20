import ChatComponent from '@components/Messenger/ChatComponent';
import ContextMenuComponent from '@components/ContextMenuComponent/ContextMenuComponent';
import createElement from '@utils/createElement';
import focusInput from '@utils/focusInput';
import { setLsItem, getLsItem, removeLsItem } from '@utils/localStorage';
import ws from '@modules/WebSocketService';
import { FILE, MSG, POST } from '@config/config';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import { FilesRequests } from '@modules/api';
import FileAttachmentComponent from '@components/FileAttachmentComponent/FileAttachmentComponent';
import EmojiBarComponent from './EmojiBarComponent/EmojiBarComponent';


const MOBILE_MAX_WIDTH = 610;
const TEXTAREA_PLACEHOLDER = 'Напишите сообщение...';
const CHAT_DEFAULT_PADDING_BOTTOM = 16;
const CHAT_MSG_PREFIX = 'chat-msg-';

const MEDIA_CONTEXT_MENU_DATA = {
    photo: {
        text: 'Медиа',
        icon: 'primary-photo-icon',
        href: 'media',
    },
    // video: {
    //     text: 'Видео',
    //     icon: 'videocamera-icon',
    // },
    // music: {
    //     text: 'Музыка',
    //     icon: 'primary-music-icon',
    // },
    file: {
        text: 'Файл',
        icon: 'file-icon',
        href: 'file',
    },
};

interface MessageBarConfig {
    chatData: Record<string, any>;
    renderLastMsg: (chatData: Record<string, any>) => void;
    chatElement: HTMLElement;
    chat: ChatComponent;
}

interface UploadData {
    payload?: {
        media: string[] | null;
        audio: string[] | null;
        files: string[] | null;
    }
}


export default class MessageBarComponent {
    private parent: HTMLElement | null = null;
    private config: MessageBarConfig;
    
    private isMobile: boolean;
    private focusTimer: any = null;
    private element: HTMLTextAreaElement | null = null;
    private attachments: HTMLElement | null = null;
    private mediaInput: FileInputComponent | null = null;
    private fileInput: FileInputComponent | null = null;
    private sendBtn: HTMLElement;
    private wrapper: HTMLElement;

    constructor(parent: HTMLElement, config: MessageBarConfig) {
        this.parent = parent;
        this.config = config;
        this.isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
        this.render();
    }

    private addEmoji(emoji: string) {
        const el = this.element;
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        const value = el.value;
    
        // Проверка на максимальную длину с учётом вставки
        if (value.length - (end - start) + emoji.length > MSG.MAX_LEN) {
            return;
        }
    
        // Вставляем эмоджи на место выделения или курсора
        const newValue = value.slice(0, start) + emoji + value.slice(end);
    
        el.value = newValue;
    
        // Перемещаем курсор сразу после вставленного эмоджи
        const cursorPos = start + emoji.length;
        el.selectionStart = el.selectionEnd = cursorPos;
    
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.focus();
    }

    private render() {
        this.wrapper = createElement({
            classes: ['msg-bar__wrapper'],
            parent: this.parent,
            attrs: { id: 'msg-bar__wrapper' },
        });

        const msgBar = createElement({
            classes: ['msg-bar'],
            parent: this.wrapper,
        });

        this.attachments = createElement({
            classes: ['msg-bar__attachments', 'hidden'],
            parent: msgBar,
        });

        const msgBarText = createElement({
            classes: ['msg-bar__text'],
            parent: msgBar,
        });

        const dropdown = createElement({
            classes: ['js-dropdown', 'dropdown', 'msg-bar__dropdown'],
            parent: msgBarText,
        });

        const contextMenu = new ContextMenuComponent(dropdown, {
            data: MEDIA_CONTEXT_MENU_DATA,
            size: 'mini',
            position: 'above-start',
        });

        createElement({
            classes: ['msg-bar__add-media'],
            parent: dropdown,
        });








        this.mediaInput = new FileInputComponent(this.attachments, {
            imitator: contextMenu.getItem('media'),
            // preview: this.mediaWrapperTemplate(),
            renderPreview: this.renderMediaPreview.bind(this),
            accept: '.jpg, .jpeg, .png, .gif, .mov, .mp4',
            id: 'message-media-upload',
            insertPosition: 'end',
            multiple: true,
            required: true,
            maxCount: POST.IMG_MAX_COUNT,
            compress: true,
            maxResolution: FILE.IMG_MAX_RES,
            maxSize: FILE.MAX_SIZE_TOTAL * FILE.MB_MULTIPLIER,
            maxSizeSingle: FILE.MAX_SIZE_SINGLE * FILE.MB_MULTIPLIER,
        });

        this.fileInput = new FileInputComponent(this.attachments, {
            imitator: contextMenu.getItem('file'),
            // preview: this.mediaWrapperTemplate(),
            renderPreview: this.renderFilePreview.bind(this),
            accept: 'any',
            id: 'message-file-upload',
            insertPosition: 'end',
            multiple: true,
            required: true,
            maxCount: POST.IMG_MAX_COUNT,
            // compress: true,
            maxResolution: FILE.IMG_MAX_RES,
            maxSize: FILE.MAX_SIZE_TOTAL * FILE.MB_MULTIPLIER,
            maxSizeSingle: FILE.MAX_SIZE_SINGLE * FILE.MB_MULTIPLIER,
        });

        this.mediaInput.addListener(this.handleMediaUpload.bind(this));
        this.fileInput.addListener(this.handleMediaUpload.bind(this));







        const value = getLsItem(
            CHAT_MSG_PREFIX + `${this.config.chatData?.id}`,
            ''
        );

        this.element = createElement({
            tag: 'textarea',
            parent: msgBarText,
            classes: ['msg-bar__msg'],
            attrs: {
                placeholder: TEXTAREA_PLACEHOLDER,
                rows: 1,
                maxLength: MSG.MAX_LEN,
            },
            text: value,
        }) as HTMLTextAreaElement;

        if (!this.isMobile) {
            this.focus();
        }

        new EmojiBarComponent(msgBarText, {
            addToMessage: this.addEmoji.bind(this),
            sendSticker: this.sendSticker.bind(this),
        });

        this.sendBtn = createElement({
            classes: [
                'msg-bar__send',
                this.element?.value.trim() === '' ? 'msg-bar__send_disabled' : null
            ],
            parent: msgBarText,
        });
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        this.handleMessageInput();
    }

    private handleMessageInput() {
        this.element?.addEventListener("input", () => {
            this.updateSendBtnState();
            if (this.element?.value.trim() !== '') {
                if (this.element) {
                    setLsItem(
                        CHAT_MSG_PREFIX + `${this.config.chatData?.id}`,
                        this.element.value.trim()
                    );
                }
                return;
            }
            removeLsItem(CHAT_MSG_PREFIX + `${this.config.chatData?.id}`);
            this.config.renderLastMsg(this.config.chatData);
        });

        this.element?.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.sendMessage();
            }
        });

        this.updateTextareaHeight();
        this.element?.addEventListener("input", () => this.updateTextareaHeight());
    }

    private handleMediaUpload() {
        const mediaCount = this.mediaInput?.getFiles().length || 0;
        const filesCount = this.fileInput?.getFiles().length || 0;

        if (!mediaCount && !filesCount) {
            this.attachments.classList.add('hidden');
        } else {
            this.attachments.classList.remove('hidden');
        }

        this.updateTextareaHeight();
        this.updateSendBtnState();
    }

    private updateSendBtnState() {
        if (
            this.element?.value.trim() === '' &&
            !this.mediaInput.isValid() &&
            !this.fileInput.isValid()
        ) {
            return this.sendBtn.classList.add('msg-bar__send_disabled');
        }

        this.sendBtn.classList.remove('msg-bar__send_disabled');   
    }

    private get areAttachmentsValid(): boolean {
        if (
            this.mediaInput.isLarge ||
            this.fileInput.isLarge
        ) {
            new PopUpComponent({
                text: `Размер файлов суммарно не должен превышать ${FILE.MAX_SIZE_TOTAL}Мб`,
                isError: true,
            });
            return false;
        }

        if (
            this.mediaInput.isAnyLarge ||
            this.fileInput.isAnyLarge
        ) {
            new PopUpComponent({
                text: `Размер каждого файла не должен превышать ${FILE.MAX_SIZE_SINGLE}Мб`,
                isError: true,
            });
            return false;
        }

        return true;
    }

    private async sendMessage() {
        if (this.sendBtn.classList.contains('msg-bar__send_disabled')) {
            return;
        }

        this.sendBtn.classList.add('msg-bar__send_disabled');

        const wsPayload = {
            chat_id: this.config.chatData?.id,
            receiver_id: this.config.chatData?.receiver_id,
            text: this.element?.value.trim(),
        }
        
        if (
            this.mediaInput?.input?.files?.length > 0 ||
            this.fileInput?.input?.files?.length > 0
        ) {
            if (!this.areAttachmentsValid) {
                return;
            }

            const formData = new FormData();
            for (const media of this.mediaInput.input.files) {
                formData.append('media', media);
            }
            for (const file of this.fileInput.input.files) {
                formData.append('files', file);
            }

            const [status, mediaData]: [number, UploadData] = await FilesRequests.upload(formData);
            switch (status) {
                case 200:
                    break;
                default:
                    return new PopUpComponent({
                        text: 'Не удалось загрузить файлы, попробуйте снова позже',
                        isError: true,
                    });
            }

            if (mediaData?.payload?.media) {
                wsPayload['media'] = mediaData.payload.media;
            }
            if (mediaData?.payload?.files) {
                wsPayload['files'] = mediaData.payload.files;
            }
            if (mediaData?.payload?.audio) {
                wsPayload['audio'] = mediaData.payload.audio;
            }
        }

        new ws().send('message', wsPayload);

        removeLsItem(CHAT_MSG_PREFIX + `${this.config.chatData?.id}`);
        this.config.renderLastMsg(this.config.chatData);

        if (this.element) {
            this.element.value = '';
        }
    }

    private sendSticker() {
        console.log('Sticker is sent');
    }

    public updateTextareaHeight() {
        console.log(this.config.chatElement);

        if (!this.config.chatElement || !this.element || !this.wrapper) return;
    
        this.element.style.height = 'auto';
        this.element.style.height = this.element.scrollHeight + 'px';
    
        const parent = this.config.chatElement.parentNode as HTMLElement;
        const scrollThreshold = this.config.chat.scroll.lastElementChild?.scrollHeight + 50; // если до конца меньше 50px, считаем "внизу"
    
        // обновляем паддинг у блока сообщений
        const newPadding = this.wrapper.clientHeight - 62 + CHAT_DEFAULT_PADDING_BOTTOM;
        this.config.chatElement.style.paddingBottom = `${newPadding}px`;
    
        // проверяем, близок ли скролл к самому низу
        const scrollBottom = parent.scrollHeight - parent.scrollTop - parent.clientHeight;
        if (
            scrollBottom <= scrollThreshold ||
            (!this.attachments.classList.contains('hidden') && scrollBottom <= scrollThreshold + this.attachments.clientHeight)
        ) {
            parent.scrollTop = parent.scrollHeight;
        }
    }

    public focus() {
        if (this.element) {
            focusInput(this.element, this.focusTimer);
        }
    }

    private renderMediaPreview(file: File, dataUrl: string): HTMLElement {
        const attachment = new FileAttachmentComponent(this.attachments, {
            type: 'media',
            file,
            dataUrl,
            classes: ['msg-bar__attachment'],
        });

        attachment.element.addEventListener('click', () => {
            this.mediaInput.removeFile(file, attachment.element);
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
            this.fileInput.removeFile(file, attachment.element);
        });

        return attachment.element;
    }
}
