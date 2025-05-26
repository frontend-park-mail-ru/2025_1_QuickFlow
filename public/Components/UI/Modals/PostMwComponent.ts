import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import TextareaComponent from '@components/UI/TextareaComponent/TextareaComponent';
import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';
import ModalWindowComponent from '@components/UI/Modals/ModalWindowComponent';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import { FILE, MEDIA, POST } from '@config/config';
import { FilesRequests, PostsRequests } from '@modules/api';
import FileAttachmentComponent from '@components/FileAttachmentComponent/FileAttachmentComponent';
import networkErrorPopUp from '@utils/networkErrorPopUp';
import { Post, PostRequest } from 'types/PostTypes';
import { UploadRequest } from 'types/UploadTypes';
import Router from '@router';


export interface PostMwConfig {
    type: 'create-post' | 'edit-post';
    data?: Post;
    target?: 'community' | 'user';
    params?: {
        author_id: string;
    };
    renderCreatedPost?: (config: Post) => void;
    onAjaxEditPost?: (config: any) => void;
}


export default class PostMwComponent extends ModalWindowComponent {
    private mediaInput: FileInputComponent | null = null;
    private filesInput: FileInputComponent | null = null;
    private button: ButtonComponent;
    private files: HTMLElement;
    private scrollWrapper: HTMLElement;

    constructor(parent: HTMLElement, config: PostMwConfig) {
        super(parent, config);
        this.render();
    }

    render() {
        super.render();

        switch (this.config.type) {
            case 'create-post':
                this.renderPostInner();
                break;
            case 'edit-post':
                this.renderPostInner(true);
                break;
        }
    }

    private renderMediaUploader() {
        const hasPics = this.config?.data?.media?.length;

        const picsWrapper = createElement({
            parent: this.modalWindow,
            classes: ['modal__pics-wrapper'],
        });

        this.scrollWrapper = createElement({
            parent: picsWrapper,
            classes: [
                'modal__pics',
                hasPics ? 'modal__pics' : 'modal__pics_blank',
            ],
        });

        const addPicWrapper = createElement({
            parent: this.scrollWrapper,
            classes: ['modal__add-pic'],
        });

        createElement({
            parent: addPicWrapper,
            classes: ['modal__camera'],
            attrs: { src: '/static/img/camera-dark-icon.svg' },
        });

        createElement({
            tag: 'h4',
            parent: addPicWrapper,
            text: 'Добавьте фото',
        });

        const fileInputConfig = {
            imitator: addPicWrapper,
            renderPreview: this.renderMediaPreview.bind(this),
            accept: MEDIA.ACCEPT,
            id: 'post-pic-upload',
            onUpload: () => this.handlePicUpload(this.scrollWrapper),
            multiple: true,
            required: true,
            maxCount: POST.IMG_MAX_COUNT,
            compress: true,
            maxResolution: MEDIA.IMG_MAX_RES,
            maxSize: MEDIA.MAX_SIZE_TOTAL,
            maxSizeSingle: MEDIA.MAX_SIZE_SINGLE,
        };

        if (hasPics) {
            fileInputConfig['preloaded'] = this.config.data.media.map(obj => obj.url);
        }

        this.mediaInput = new FileInputComponent(this.scrollWrapper, fileInputConfig);
        this.mediaInput.addListener(() => {
            const filesCount = this.mediaInput?.getFiles().length || 0;
            addPicWrapper.style.display = filesCount >= POST.IMG_MAX_COUNT ? 'none' : 'flex';
        });
        if (this.config?.data?.media?.length >= POST.IMG_MAX_COUNT) {
            addPicWrapper.style.display = 'none';
        }

        this.renderPaginator(picsWrapper, this.scrollWrapper);
    }

    private renderMediaPreview(file: File, dataUrl: string): HTMLElement {
        const attachment = new FileAttachmentComponent(this.scrollWrapper, {
            type: 'media',
            file,
            dataUrl,
            classes: ['modal__pic'],
        });

        attachment.element.addEventListener('click', () => {
            this.mediaInput.removeFile(file, attachment.element);
        });

        return attachment.element;
    }

    private renderPaginator(picsWrapper: HTMLElement, scrollWrapper: HTMLElement) {
        const leftArrow = createElement({
            parent: picsWrapper,
            classes: ['modal__pics-nav', 'modal__pics-nav_prev'],
        });

        insertIcon(leftArrow, {
            name: 'prev-arrow-icon',
            classes: ['modal__nav-icon'],
        });

        const rightArrow = createElement({
            parent: picsWrapper,
            classes: ['modal__pics-nav', 'modal__pics-nav_next'],
        });

        insertIcon(rightArrow, {
            name: 'next-arrow-icon',
            classes: ['modal__nav-icon'],
        });

        leftArrow.addEventListener('click', () => {
            scrollWrapper.scrollBy({ left: -136, behavior: 'smooth' });
        });

        rightArrow.addEventListener('click', () => {
            scrollWrapper.scrollBy({ left: 136, behavior: 'smooth' });
        });

        this.createResizeObserver(scrollWrapper, leftArrow, rightArrow);
        this.createMutationObserver(scrollWrapper, leftArrow, rightArrow);
    }

    private createResizeObserver(
        scrollWrapper: HTMLElement,
        leftArrow: HTMLElement,
        rightArrow: HTMLElement
    ) {
        scrollWrapper.addEventListener('scroll', () => this.updateArrowVisibility(scrollWrapper, leftArrow, rightArrow));
        
        new ResizeObserver(
            () => this.updateArrowVisibility(
                scrollWrapper,
                leftArrow,
                rightArrow
            )
        )
        .observe(scrollWrapper);

        requestAnimationFrame(() => this.updateArrowVisibility(scrollWrapper, leftArrow, rightArrow));
    }

    private updateArrowVisibility(
        scrollWrapper: HTMLElement,
        leftArrow: HTMLElement,
        rightArrow: HTMLElement
    ) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollWrapper;
        leftArrow.style.opacity = scrollLeft > 0 ? '1' : '0';
        rightArrow.style.opacity = (scrollLeft + clientWidth) < scrollWidth ? '1' : '0';
    }

    private createMutationObserver(
        scrollWrapper: HTMLElement,
        leftArrow: HTMLElement,
        rightArrow: HTMLElement
    ) {
        const observer = new MutationObserver(
            () => this.updateArrowVisibility(
                scrollWrapper,
                leftArrow,
                rightArrow
            )
        );
        
        observer.observe(scrollWrapper, {
            attributes: false,
            childList: true,
            subtree: false,
        });
    }

    private renderPostInner(isFilled = false) {
        if (!this.modalWindow || !this.title) return;

        this.modalWindow.classList.add('modal_post');
        this.title.textContent = isFilled ? 'Редактирование поста' : 'Новый пост';

        this.renderMediaUploader();
        this.renderFilesUploader();

        const textarea = new TextareaComponent(this.modalWindow, {
            placeholder: 'Поделитесь своими мыслями',
            value: this.config?.data?.text || '',
            showCharactersLeft: true,
            maxLength: POST.MAX_LEN,
            required: true,
        });

        this.button = new ButtonComponent(this.modalWindow, {
            text: isFilled ? 'Сохранить' : 'Опубликовать',
            variant: 'primary',
            size: 'small',
            onClick: () => {
                if (!textarea.textarea) return;
                this.handlePostSubmit(textarea.textarea.value.trim());
            },
            disabled: true,
            validationType: 'some',
            stateUpdaters: [textarea, this.mediaInput, this.filesInput],
        });
    }

    private renderFilesUploader() {
        const hasFiles = this.config?.data?.files?.length;

        const fileUploaderWrapper = createElement({
            parent: this.modalWindow,
            classes: ['modal__file-uploader'],
        });

        insertIcon(fileUploaderWrapper, {
            name: 'clip-icon',
            classes: ['modal__clip-icon'],
        });

        createElement({
            parent: fileUploaderWrapper,
            text: 'Прикрепить файлы'
        });

        this.files = createElement({
            parent: this.modalWindow,
            classes: ['modal__files'],
        });

        const fileInputConfig = {
            imitator: fileUploaderWrapper,
            id: 'js-modal_post-file-uploader',
            maxSize: FILE.MAX_SIZE_TOTAL,
            accept: FILE.ACCEPT,
            multiple: true,
            maxSizeSingle: FILE.MAX_SIZE_SINGLE,
            renderPreview: this.renderFilePreview.bind(this),
            insertPosition: 'end',
            required: true,
            maxCount: POST.FILE_MAX_COUNT,
        };

        if (hasFiles) {
            fileInputConfig['preloaded'] = this.config.data.files;
        }

        this.filesInput = new FileInputComponent(this.files, fileInputConfig);
    }

    private renderFilePreview(file: File, dataUrl: string): HTMLElement {
        const attachment = new FileAttachmentComponent(this.files, {
            type: 'file',
            file,
            dataUrl,
            classes: ['msg__file'],
        });

        attachment.element.addEventListener('click', () => {
            this.filesInput.removeFile(file, attachment.element);
        });

        return attachment.element;
    }

    private handlePicUpload(scrollWrapper: HTMLElement) {
        scrollWrapper.classList.remove('modal__pics_blank');
    }

    private async handlePostSubmit(text: string) {
        this.button.disable();

        if (
            !text &&
            !this?.mediaInput?.input?.files?.length &&
            !this?.filesInput?.input?.files?.length
        ) return;

        if (this.mediaInput.isLarge) {
            return new PopUpComponent({
                text: `Размер фотографий суммарно не должен превышать ${FILE.MAX_SIZE_TOTAL}Мб`,
                isError: true,
            });
        }

        if (this.mediaInput.isAnyLarge) {
            return new PopUpComponent({
                text: `Размер каждой фотографии не должен превышать ${FILE.MAX_SIZE_SINGLE}Мб`,
                isError: true,
            });
        }

        const postReqData: PostRequest = {};
        postReqData.text = text;

        const uploadReqData: UploadRequest = {};

        if (this?.mediaInput?.input?.files?.length) {
            uploadReqData.media = this.mediaInput.input.files;
        }

        if (this?.filesInput?.input?.files?.length) {
            uploadReqData.files = this.filesInput.input.files;
        }

        if (Object.keys(uploadReqData).length) {
            const [status, uploadData] = await FilesRequests.upload(uploadReqData);
            switch (status) {
                case 200:
                    break;
                case 401:
                    Router.go({ path: '/login' });
                    return;
                default:
                    networkErrorPopUp({ text: 'Не удалось загрузить вложения' });
                    return;
            }

            postReqData.media = uploadData.payload.media;
            postReqData.files = uploadData.payload.files;
            postReqData.audio = uploadData.payload.audio;
        }

        if (this.config.target === 'community') {
            postReqData.author_id = this.config?.params?.author_id;
            postReqData.author_type = 'community';
        }

        if (this.config.type === 'create-post') {
            const [status, postData] = await PostsRequests.createPost(postReqData);
            switch (status) {
                case 200:
                    this.config.renderCreatedPost(postData?.payload);
                    this.close();
                    break;
                case 413:
                    alert('File is too large');
                    break;
                default:
                    networkErrorPopUp();
            }
        } else if (this.config.type === 'edit-post') {
            const [status, postData] = await PostsRequests.editPost(this.config.data.id, postReqData);
            switch (status) {
                case 200:
                    this.config.onAjaxEditPost(postData?.payload);
                    this.close();
                    break;
                case 413:
                    alert('File is too large');
                    break;
                default:
                    networkErrorPopUp();
            }
        }
    }
}
