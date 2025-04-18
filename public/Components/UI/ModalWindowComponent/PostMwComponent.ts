import ButtonComponent from '../ButtonComponent/ButtonComponent';
import TextareaComponent from '@components/UI/TextareaComponent/TextareaComponent';
import createElement from '@utils/createElement';
import Ajax from '@modules/ajax';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';
import ModalWindowComponent from '@components/UI/ModalWindowComponent/ModalWindowComponent';


const POST_TEXT_MAX_LENGTH = 4000;
const PICS_MAX_COUNT = 10;
const PIC_MAX_RESOLUTION = 1680;


export default class PostMwComponent extends ModalWindowComponent {
    fileInput: FileInputComponent | null = null;
    button: ButtonComponent;

    constructor(parent: any, config: any) {
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
            maxCount: PICS_MAX_COUNT,
            compress: true,
            maxSize: PIC_MAX_RESOLUTION,
        };
        
        if (hasPics) {
            fileInputConfig.preloaded = this.config.data.pics;
        }

        this.fileInput = new FileInputComponent(scrollWrapper, fileInputConfig);
        this.fileInput.addListener(() => {
            const filesCount = this.fileInput?.getFiles().length || 0;
            addPicWrapper.style.display = filesCount >= PICS_MAX_COUNT ? 'none' : 'flex';
        });
        if (this.config?.data?.pics?.length >= PICS_MAX_COUNT) {
            addPicWrapper.style.display = 'none';
        }

        this.renderPaginator(picsWrapper, scrollWrapper);
    }

    private renderPaginator(picsWrapper: HTMLElement, scrollWrapper: HTMLElement) {
        const leftArrow = createElement({
            parent: picsWrapper,
            classes: ['modal__pics-nav', 'modal__pics-nav_prev'],
        });

        createElement({
            parent: leftArrow,
            attrs: { src: '/static/img/prev-arrow-icon.svg' }
        });

        const rightArrow = createElement({
            parent: picsWrapper,
            classes: ['modal__pics-nav', 'modal__pics-nav_next'],
        });

        createElement({
            parent: rightArrow,
            attrs: { src: '/static/img/next-arrow-icon.svg' }
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
            maxLength: POST_TEXT_MAX_LENGTH,
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

        const formData = new FormData();
        formData.append('text', text);

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
                            console.log("File is too large");
                            alert('File is too large');
                            break;
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
                            console.log("File is too large");
                            alert('File is too large');
                            break;
                    }
                }
            });
        }
    }
}
