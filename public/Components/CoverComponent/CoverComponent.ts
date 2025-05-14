import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';
import { FILE } from '@config/config';
import createElement from '@utils/createElement';


const DEFAULT_SRC = '/static/img/default-cover.jpg';


export default class CoverComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    coverWrapper: HTMLElement | null = null;
    cover: HTMLElement | null = null;
    fileInput: FileInputComponent | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {
        this.coverWrapper = createElement({
            parent: this.parent,
            classes: ['cover']
        });

        this.cover = createElement({
            parent: this.coverWrapper,
            classes: ['cover__img'],
            attrs: {src: this.config.src || DEFAULT_SRC}
        });

        switch (this.config.type) {
            case 'edit':
                this.renderEdit();
                break;
        }
    }

    renderEdit() {
        if (!this.coverWrapper) return;

        this.coverWrapper.classList.add('cover_edit');
        
        const coverUploadBtn = new ButtonComponent(this.coverWrapper, {
            text: 'Изменить обложку',
            variant: 'overlay',
            size: 'small',
            classes: ['cover__btn'],
        });
        
        this.fileInput = new FileInputComponent(this.parent.parentNode as HTMLElement, {
            imitator: coverUploadBtn.buttonElement,
            preview: this.cover,
            id: 'profile-cover-upload',
            name: 'cover',
            compress: true,
            maxResolution: FILE.IMG_MAX_RES,
            maxSize: FILE.MAX_SIZE_SINGLE * FILE.MB_MULTIPLIER,
        })
    }
}
