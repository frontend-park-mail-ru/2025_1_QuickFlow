import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import TextareaComponent from '@components/UI/TextareaComponent/TextareaComponent';
import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';
import Ajax from '@modules/ajax';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';
import ModalWindowComponent from '@components/UI/ModalWindowComponent/ModalWindowComponent';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import { FILE, POST } from '@config';


export default class PostMwComponent extends ModalWindowComponent {
    fileInput: FileInputComponent | null = null;
    button: ButtonComponent;

    constructor(parent: HTMLElement, config: Record<string, any>) {
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

    renderPicsUploader() {
        const hasPics = this.config?.data?.pics && this.config?.data?.pics.length > 0;

        const picsWrapper = createElement({
            parent: this.modalWindow,
            classes: ['modal__pics-wrapper'],
        });

        const scrollWrapper = createElement({
            parent: picsWrapper,
            classes: [
                'modal__pics',
                hasPics ? 'modal__pics' : 'modal__pics_blank',
            ],
        });
        const addPicWrapper = createElement({
            parent: scrollWrapper,
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

        const fileInputConfig: Record<string, any> = {
            imitator: addPicWrapper,
            preview: this.picWrapperTemplate(),
            id: 'post-pic-upload',
            onUpload: () => this.handlePicUpload(scrollWrapper),
            multiple: true,
            required: true,
            maxCount: POST.IMG_MAX_COUNT,
            compress: true,
            maxResolution: FILE.IMG_MAX_RES,
            maxSize: FILE.MAX_SIZE_TOTAL * FILE.MB_MULTIPLIER,
            maxSizeSingle: FILE.MAX_SIZE_SINGLE * FILE.MB_MULTIPLIER,
        };
        
        if (hasPics) {
            fileInputConfig.preloaded = this.config.data.pics;
        }

        this.fileInput = new FileInputComponent(scrollWrapper, fileInputConfig);
        this.fileInput.addListener(() => {
            const filesCount = this.fileInput?.getFiles().length || 0;
            addPicWrapper.style.display = filesCount >= POST.IMG_MAX_COUNT ? 'none' : 'flex';
        });
        if (this.config?.data?.pics?.length >= POST.IMG_MAX_COUNT) {
            addPicWrapper.style.display = 'none';
        }

        this.renderPaginator(picsWrapper, scrollWrapper);
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

    renderPostInner(isFilled = false) {
        if (!this.modalWindow || !this.title) return;

        this.modalWindow.classList.add('modal_post');
        this.title.textContent = isFilled ? 'Редактирование поста' : 'Новый пост';

        this.renderPicsUploader();

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
            stateUpdaters: [textarea, this.fileInput],
        });
    }

    picWrapperTemplate() {
        const picWrapperTemplate = createElement({
            classes: ['modal__pic'],
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

    handlePicUpload(scrollWrapper: HTMLElement) {
        scrollWrapper.classList.remove('modal__pics_blank');
    }

    async handlePostSubmit(text: string) {
        this.button.disable();

        if (
            !text && (
                !this.fileInput ||
                !this.fileInput.input ||
                !this.fileInput.input.files ||
                !this.fileInput.input.files.length
            )
        ) return;

        if (this.fileInput.isLarge) {
            return new PopUpComponent({
                text: `Размер фотографий суммарно не должен превышать ${FILE.MAX_SIZE_TOTAL}Мб`,
                isError: true,
            });
        }

        if (this.fileInput.isAnyLarge) {
            return new PopUpComponent({
                text: `Размер каждой фотографии не должен превышать ${FILE.MAX_SIZE_SINGLE}Мб`,
                isError: true,
            });
        }

        const formData = new FormData();
        formData.append('text', text);

        if (this.config.target === 'community') {
            console.log(this.config?.params);
            formData.append('author_id', this.config?.params?.author_id);
            formData.append('author_type', 'community');
        }

        if (
            this.fileInput &&
            this.fileInput.input &&
            this.fileInput.input.files &&
            this.fileInput.input.files.length > 0
        ) {
            for (const file of this.fileInput.input.files) {
                formData.append('pics', file);
            }
        }

        if (this.config.type === 'create-post') {
            Ajax.post({
                url: '/post',
                body: formData,
                isFormData: true,
                callback: (status: number, config: any) => {
                    switch (status) {
                        case 200:
                            this.config.renderCreatedPost(config?.payload);
                            this.close();
                            break;
                        case 413:
                            alert('File is too large');
                            break;
                        default:
                            this.cbFailed();
                    }
                }
            });
        } else if (this.config.type === 'edit-post') {
            Ajax.put({
                url: `/posts/${this.config.data.id}`,
                body: formData,
                isFormData: true,
                callback: (status: number, config: any) => {
                    switch (status) {
                        case 200:
                            this.config.onAjaxEditPost(config?.payload);
                            this.close();
                            break;
                        case 413:
                            alert('File is too large');
                            break;
                        default:
                            this.cbFailed();
                    }
                }
            });
        }
    }

    cbFailed() {
        new PopUpComponent({
            text: 'Не удалось сохранить изменения',
            size: "large",
            isError: true,
        });
    }
}
