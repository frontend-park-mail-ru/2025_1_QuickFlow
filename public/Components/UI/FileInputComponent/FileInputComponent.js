import createElement from '../../../utils/createElement.js';


const DEFAULT_TYPE = 'file';
const DEFAULT_REQUIRED = false;
const DEFAULT_ACCEPT_IMAGE = 'image/*';


export default class FileInputComponent {
    #parent
    #config
    #files = []
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

        if (this.#config.multiple) {
            this.input.setAttribute('multiple', '');
        }

        if (this.#config.imitator) {
            this.input.classList.add('hidden');
            this.#config.imitator.addEventListener('click', () => {
                this.input.click();
            });
        }
        
        if (this.#config.preview) {
            this.input.onchange = async () => {
                try {
                    await this.#config.multiple ? this.multipleOnchange() : this.singleOnchange();
                    this.#config.onUpload ? this.#config.onUpload() : null;
                } catch (error) {
                    console.error("Ошибка при чтении файла", error);
                }
            };
        }
    }
    
    async multipleOnchange() {
        const newFiles = Array.from(event.target.files);
        this.#files.push(...newFiles);

        const imageDataUrls = await Promise.all(newFiles.map(this.readImageFile));
        for (const imageDataUrl of imageDataUrls) {
            const picWrapper = this.#config.preview.cloneNode(true);
            picWrapper.querySelector('img').src = imageDataUrl;
            this.#parent.insertBefore(picWrapper, this.#config.imitator);
        }
        
        this.updateInputFiles();
    }

    async singleOnchange() {
        const imageDataUrl = await this.readImageFile(event.target.files[0]);
        this.#config.preview.src = imageDataUrl;
    }

    async readImageFile(file) {
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
            reader.onload = event => resolve(event.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    updateInputFiles() {
        const dataTransfer = new DataTransfer();

        for (const file of this.#files) {
            dataTransfer.items.add(file);
        }

        this.input.files = dataTransfer.files;
    }

    getFiles() {
        return this.#files;
    }
}
