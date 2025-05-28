import ChatComponent from '@components/Messenger/ChatComponent';
import createElement from '@utils/createElement';
import focusInput from '@utils/focusInput';
import { setLsItem, getLsItem, removeLsItem } from '@utils/localStorage';
import ws from '@modules/WebSocketService';
import { MSG } from '@config/config';
import { ChatsRequests, FilesRequests } from '@modules/api';
import FileAttachmentComponent from '@components/FileAttachmentComponent/FileAttachmentComponent';
import EmojiBarComponent from './EmojiBarComponent/EmojiBarComponent';
import insertSym from '@utils/insertSym';
import { UploadRequest } from 'types/UploadTypes';
import networkErrorPopUp from '@utils/networkErrorPopUp';
import ChatsPanelComponent from '../ChatsPanelComponent';
import validateUploadData from '@utils/validateUploadData';
import AttachmentsDropdownComponent from '@components/AttachmentsDropdownComponent/AttachmentsDropdownComponent';


const MOBILE_MAX_WIDTH = 610;
const TEXTAREA_PLACEHOLDER = 'Напишите сообщение...';
const CHAT_DEFAULT_PADDING_BOTTOM = 16;
const CHAT_MSG_PREFIX = 'chat-msg-';


interface MessageBarConfig {
    chatData: Record<string, any>;
    chatsPanel: ChatsPanelComponent;
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
    private attachmentsDropdown: AttachmentsDropdownComponent | null = null;
    private sendBtn: HTMLElement;
    private wrapper: HTMLElement;

    constructor(parent: HTMLElement, config: MessageBarConfig) {
        this.parent = parent;
        this.config = config;
        this.isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
        this.render();
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

        this.attachmentsDropdown = new AttachmentsDropdownComponent(msgBarText, {
            attachments: this.attachments,
            handleMediaUpload: this.handleMediaUpload.bind(this),
            renderFilePreview: this.renderFilePreview.bind(this),
            renderMediaPreview: this.renderMediaPreview.bind(this),
        });

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

    private addEmoji(emoji: string) {
        insertSym(this.element, emoji, {
            maxLength: MSG.MAX_LEN,
        });
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
            this.config.chatsPanel.renderLastMsg(this.config.chatData);
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
        const mediaCount = this.attachmentsDropdown.mediaInput?.getFiles().length || 0;
        const filesCount = this.attachmentsDropdown.filesInput?.getFiles().length || 0;

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
            !this.attachmentsDropdown.mediaInput.isValid() &&
            !this.attachmentsDropdown.filesInput.isValid()
        ) {
            return this.sendBtn.classList.add('msg-bar__send_disabled');
        }

        this.sendBtn.classList.remove('msg-bar__send_disabled');   
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
                wsPayload['media'] = mediaData.payload.media;
            }
            if (mediaData?.payload?.files) {
                wsPayload['files'] = mediaData.payload.files;
            }
            if (mediaData?.payload?.audio) {
                wsPayload['audio'] = mediaData.payload.audio;
            }

            this.attachmentsDropdown.mediaInput.clear();
            this.attachmentsDropdown.filesInput.clear();
            this.attachments.innerHTML = '';
        }

        new ws().send('message', wsPayload);

        removeLsItem(CHAT_MSG_PREFIX + `${this.config.chatData?.id}`);
        this.config.chatsPanel.renderLastMsg(this.config.chatData);

        if (this.element) {
            this.element.value = '';
        }
    }

    private sendSticker(stickerUrl: string) {
        ChatsRequests.sendMessage({
            receiver_id: this.config.chatData?.receiver_id,
            chat_id: this.config.chatData?.id,
            text: '',
            stickers: [stickerUrl],
        });
    }

    public updateTextareaHeight() {
        if (
            !this.config.chatElement ||
            !this.element ||
            !this.wrapper
        ) return;
    
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
}
