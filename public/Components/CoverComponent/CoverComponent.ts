import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';
import createElement from '@utils/createElement';


const DEFAULT_SRC = '/static/img/default-cover.jpg';
const COVER_MAX_RESOLUTION = 1680;


export default class CoverComponent {
    #parent
    #config
    coverWrapper: HTMLElement | null;
    cover: HTMLElement | null;
    fileInput: FileInputComponent | null;
    constructor(parent: any, config: any) {
        this.#parent = parent;
        this.#config = config;

        this.coverWrapper = null;
        this.cover = null;
        this.fileInput = null;

        this.render();
    }

    render() {
        this.coverWrapper = createElement({
            parent: this.#parent,
            classes: ['cover']
        });

        this.cover = createElement({
            parent: this.coverWrapper,
            classes: ['cover__img'],
            attrs: {src: this.#config.src || DEFAULT_SRC}
        });

        switch (this.#config.type) {
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
        
        this.fileInput = new FileInputComponent(this.#parent.parentNode, {
            imitator: coverUploadBtn.buttonElement,
            preview: this.cover,
            id: 'profile-cover-upload',
            name: 'cover',
            compress: true,
            maxSize: COVER_MAX_RESOLUTION,
        })
    }
}
