import ChatComponent from '@components/MessengerComponent/ChatComponent';
import ContextMenuComponent from '@components/ContextMenuComponent/ContextMenuComponent';
import createElement from '@utils/createElement';
import focusInput from '@utils/focusInput';
import { setLsItem, getLsItem, removeLsItem } from '@utils/localStorage';
import ws from '@modules/WebSocketService';
import { FILE, MSG, POST } from '@config/config';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import { ChatsRequests } from '@modules/api';


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


export default class MessageBarComponent {
    private parent: HTMLElement | null = null;
    private config: MessageBarConfig;
    
    private isMobile: boolean;
    private focusTimer: any = null;
    private element: HTMLTextAreaElement | null = null;
    private attachments: HTMLElement | null = null;
    private attachmentInput: FileInputComponent | null = null;
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

        const dropdown = createElement({
            classes: ['js-dropdown', 'dropdown', 'msg-bar__dropdown'],
            parent: msgBarText,
        });

        new ContextMenuComponent(dropdown, {
            data: MEDIA_CONTEXT_MENU_DATA,
            size: 'mini',
            position: 'above-start',
        });

        createElement({
            classes: ['msg-bar__add-media'],
            parent: dropdown,
        });







        const fileInputConfig: Record<string, any> = {
            imitator: dropdown.querySelector('.context-menu__option[data-href="media"]'),
            preview: this.mediaWrapperTemplate(),
            id: 'message-media-upload',
            insertPosition: 'end',
            multiple: true,
            required: true,
            maxCount: POST.IMG_MAX_COUNT,
            compress: true,
            maxResolution: FILE.IMG_MAX_RES,
            maxSize: FILE.MAX_SIZE_TOTAL * FILE.MB_MULTIPLIER,
            maxSizeSingle: FILE.MAX_SIZE_SINGLE * FILE.MB_MULTIPLIER,
        };

        this.attachmentInput = new FileInputComponent(this.attachments, fileInputConfig);
        this.handleMediaUpload();







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

    private mediaWrapperTemplate() {
        const picWrapperTemplate = createElement({
            classes: ['msg-bar__attachment'],
        });
        createElement({
            tag: 'img',
            parent: picWrapperTemplate,
            classes: ['modal__img'],
        });
        const overlay = createElement({
            parent: picWrapperTemplate,
            classes: [
                "modal__pic-overlay",
                "js-post-pic-delete",
            ],
        });
        createElement({
            parent: overlay,
            classes: ["modal__pic-delete"],
        });
        return picWrapperTemplate;
    }

    private handleMediaUpload() {
        this.attachmentInput.addListener(() => {
            const filesCount = this.attachmentInput?.getFiles().length || 0;
            if (!filesCount) {
                this.attachments.classList.add('hidden');
            } else {
                this.attachments.classList.remove('hidden');
            }
            this.updateTextareaHeight();
            this.updateSendBtnState();
        });
    }

    private updateSendBtnState() {
        if (
            this.element?.value.trim() === '' &&
            !this.attachmentInput.isValid()
        ) {
            return this.sendBtn.classList.add('msg-bar__send_disabled');
        }

        this.sendBtn.classList.remove('msg-bar__send_disabled');   
    }

    private get areAttachmentsValid(): boolean {
        if (this.attachmentInput.isLarge) {
            new PopUpComponent({
                text: `Размер файлов суммарно не должен превышать ${FILE.MAX_SIZE_TOTAL}Мб`,
                isError: true,
            });
            return false;
        }

        if (this.attachmentInput.isAnyLarge) {
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
            this.attachmentInput &&
            this.attachmentInput.input &&
            this.attachmentInput.input.files &&
            this.attachmentInput.input.files.length > 0
        ) {
            if (!this.areAttachmentsValid) {
                return;
            }

            const formData = new FormData();
            for (const attachment of this.attachmentInput.input.files) {
                formData.append('attachments', attachment);
            }

            // const [status, mediaData] = await ChatsRequests.uploadMedia();
            const [status, mediaData] = [200, {} as Record<string, any>];
            switch (status) {
                case 200:
                    break;
                default:
                    return new PopUpComponent({
                        text: 'Не удалось загрузить файлы, попробуйте снова позже',
                        isError: true,
                    });
            }

            if (mediaData?.payload?.length) {
                wsPayload['media'] = mediaData?.payload;
            }
        }

        new ws().send('message', wsPayload);

        removeLsItem(CHAT_MSG_PREFIX + `${this.config.chatData?.id}`);
        this.config.renderLastMsg(this.config.chatData);

        if (this.element) {
            this.element.value = '';
        }
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
}
