import createElement from '@utils/createElement';


const DEFAULT_TYPE = 'file';
const DEFAULT_NAME = '';
const DEFAULT_ACCEPT_IMAGE = '.jpg, .jpeg, .png, .gif';


export default class FileInputComponent {
    #parent;
    #config;
    #files: Array<File> = [];
    input: HTMLInputElement | null = null;
    constructor(parent: any, config: any) {
        this.#config = config;
        this.#parent = parent;

        this.render();
    }

    get name() {
        return this.#config.name?.trim();
    }

    get value() {
        if (
            !this.input ||
            !this.input.files
        ) return;

        if (this.input.files.length === 1) {
            return this.input.files[0];
        }

        return this.input.files;
    }

    get required() {
        return this.#config.required;
    }

    isEmpty() {
        if (
            !this.input ||
            !this.input.files
        ) return;
        
        return !this.input.files || this.input.files.length === 0;
    }

    render() {
        this.input = createElement({
            parent: this.#parent,
            tag: 'input',
            attrs: {
                type: DEFAULT_TYPE,
                accept: this.#config.accept || DEFAULT_ACCEPT_IMAGE,
                name: this.name || DEFAULT_NAME,
                id: this.#config.id || ''
            },
            classes: this.#config.classes,
        }) as HTMLInputElement;

        if (this.required) {
            this.input.setAttribute('required', '');
        }

        if (this.#config.multiple) {
            this.input.setAttribute('multiple', '');
        }

        if (this.#config.imitator) {
            this.input.classList.add('hidden');
            this.#config.imitator.addEventListener('click', () => {
                if (!this.input) return;
                this.input.click();
            });
        }
        
        if (this.#config.preview) {
            this.input.onchange = async (event) => {
                try {
                    await this.#config.multiple ? this.multipleOnchange(event) : this.singleOnchange(event);
                    this.#config.onUpload ? this.#config.onUpload() : null;
                } catch (error) {
                    console.error("Ошибка при чтении файла", error);
                }
            };
        }

        if (Array.isArray(this.#config.preloaded) && this.#config.preloaded.length > 0) {
            this.loadPreloadedFiles(this.#config.preloaded);
        }
    }
    
    async multipleOnchange(event: any) {
        const newFiles: Array<File> = Array.from(event.target.files);
        this.#files.push(...newFiles);

        const imageDataUrls = await Promise.all(newFiles.map(this.readImageFile));
        for (const imageDataUrl of imageDataUrls) {
            const picWrapper = this.#config.preview.cloneNode(true);
            picWrapper.querySelector('img').src = imageDataUrl;
            this.#parent.insertBefore(picWrapper, this.#config.imitator);
        }
        
        this.updateInputFiles();
    }

    async singleOnchange(event: any) {
        const imageDataUrl = await this.readImageFile(event.target.files[0]);
        this.#config.preview.src = imageDataUrl;
    }

    async readImageFile(file: File) {
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
            reader.onload = (event) => {
                if (!event.target) return;
                resolve(event.target.result);
            }
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    updateInputFiles() {
        if (!this.input) return;

        const dataTransfer = new DataTransfer();

        for (const file of this.#files) {
            dataTransfer.items.add(file);
        }

        this.input.files = dataTransfer.files;
    }

    async loadPreloadedFiles(srcList: any) {
        const preloadedFiles = await Promise.all(
            srcList.map(this.fetchImageAsFile)
        );

        this.#files.push(...preloadedFiles);
        this.updateInputFiles();

        if (this.#config.preview) {
            for (const src of srcList) {
                const picWrapper = this.#config.preview.cloneNode(true);
                picWrapper.querySelector('img').src = src;
                this.#parent.insertBefore(picWrapper, this.#config.imitator);
            }
        }
    }

    async fetchImageAsFile(src: any) {
        const response = await fetch(src);
        const blob = await response.blob();
        const filename = src.split('/').pop().split('?')[0] || 'image.jpg';
        return new File([blob], filename, { type: blob.type });
    }

    addListener(listener: any) {
        if (!this.input) return;
        this.input.addEventListener('change', listener);
    }

    getFiles() {
        return this.#files;
    }

    isValid() {
        if (!this.required) return true;
        return this.#files.length > 0;
    }
}
