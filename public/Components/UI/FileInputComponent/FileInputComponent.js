import createElement from '../../../utils/createElement.js';


const DEFAULT_TYPE = 'file';
const DEFAULT_REQUIRED = false;
const DEFAULT_ACCEPT_IMAGE = 'image/*';

export default class FileInputComponent {
    #config
    #parent
    constructor(parent, config) {
        this.#config = config;
        this.#parent = parent;

        this.input = null;
        this.render();
    }

    render() {
        this.input = createElement({
            parent: this.#parent,
            tag: 'input',
            attrs: {
                type: DEFAULT_TYPE,
                required: this.#config.required || DEFAULT_REQUIRED,
                accept: this.#config.accept || DEFAULT_ACCEPT_IMAGE,
                id: this.#config.id || ''
            },
            classes: this.#config.classes,
        });

        if (this.#config.imitator) {
            this.input.classList.add('hidden');
            this.#config.imitator.addEventListener('click', () => {
                this.input.click();
            });
        }
        
        if (this.#config.preview) {
            this.input.onchange = async event => {
                try {
                    const imageDataUrl = await this.readImageFile(event.target.files[0]);
                    this.#config.preview.src = imageDataUrl;
                } catch (error) {
                    console.error("Ошибка при чтении файла", error);
                }
            };
        }
    }

    async readImageFile(file) {
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
            reader.onload = event => resolve(event.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
