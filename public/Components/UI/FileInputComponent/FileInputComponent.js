import createElement from '../../../utils/createElement.js';


const DEFAULT_TYPE = 'file';
// const DEFAULT_REQUIRED = false;
const DEFAULT_NAME = '';
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

    get name() {
        return this.input.name.trim();
    }

    get value() {
        if (this.input.files.length === 1) return this.input.files[0];
        return this.input.files;
    }

    render() {
        this.input = createElement({
            parent: this.#parent,
            tag: 'input',
            attrs: {
                type: DEFAULT_TYPE,
                accept: this.#config.accept || DEFAULT_ACCEPT_IMAGE,
                name: this.#config.name || DEFAULT_NAME,
                id: this.#config.id || ''
            },
            classes: this.#config.classes,
        });

        if (this.#config.required) {
            this.input.setAttribute('required', '');
        }

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
            this.input.onchange = async (event) => {
                try {
                    await this.#config.multiple ? this.multipleOnchange(event) : this.singleOnchange();
                    this.#config.onUpload ? this.#config.onUpload() : null;
                } catch (error) {
                    console.error("Ошибка при чтении файла", error);
                }
            };
        }
    }
    
    async multipleOnchange(event) {
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

    addListener(listener) {
        this.input.addEventListener('change', listener);
    }

    getFiles() {
        return this.#files;
    }

    isValid() {
        if (!this.#config.required) return true;
        return this.#files.length > 0;
    }
}
