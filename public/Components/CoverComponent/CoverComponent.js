import ButtonComponent from '../UI/ButtonComponent/ButtonComponent.js';
import FileInputComponent from '../UI/FileInputComponent/FileInputComponent.js';
import createElement from '../../utils/createElement.js';


const DEFAULT_SRC = '/static/img/default-cover.jpg';


export default class CoverComponent {
    #parent
    #config
    constructor(parent, config) {
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
        })
    }
}
