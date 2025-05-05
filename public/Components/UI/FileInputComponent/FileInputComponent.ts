import createElement from '@utils/createElement';


const DEFAULT_TYPE = 'file';
const DEFAULT_NAME = '';
const DEFAULT_ACCEPT_IMAGE = '.jpg, .jpeg, .png, .gif';


export default class FileInputComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private files: Array<File> = [];
    private readyCallbacks: Array<() => void> = [];

    input: HTMLInputElement | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.config = config;
        this.parent = parent;
        this.render();
    }

    get name() {
        return this.config.name?.trim();
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
        return this.config.required;
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
            parent: this.parent,
            tag: 'input',
            attrs: {
                type: DEFAULT_TYPE,
                accept: this.config.accept || DEFAULT_ACCEPT_IMAGE,
                name: this.name || DEFAULT_NAME,
                id: this.config.id || ''
            },
            classes: this.config.classes,
        }) as HTMLInputElement;

        if (this.required) {
            this.input.setAttribute('required', '');
        }

        if (this.config.multiple) {
            this.input.setAttribute('multiple', '');
        }

        if (this.config.imitator) {
            this.input.classList.add('hidden');
            this.config.imitator.addEventListener('click', () => {
                if (!this.input) return;
                this.input.click();
            });
        }
        
        if (this.config.preview) {
            this.input.onchange = async (event) => {
                try {
                    await this.config.multiple ? this.multipleOnchange(event) : this.singleOnchange(event);
                    this.config.onUpload ? this.config.onUpload() : null;
                } catch (error) {
                    console.error("Ошибка при чтении файла", error);
                }
            };
        }

        if (Array.isArray(this.config.preloaded) && this.config.preloaded.length > 0) {
            this.loadPreloadedFiles(this.config.preloaded);
        }
    }

    async singleOnchange(event: any) {
        let file = event.target.files[0];
        if (this.config.compress) {
            file = await this.resizeImage(file);
        }
        this.files.push(file);

        const imageDataUrl = await this.readImageFile(file);
        this.config.preview.src = imageDataUrl;
        
        this.triggerReady();
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

        for (const file of this.files) {
            dataTransfer.items.add(file);
        }

        this.input.files = dataTransfer.files;
    }

    async loadPreloadedFiles(srcList: any) {
        const preloadedFiles = await Promise.all(
            srcList.map(this.fetchImageAsFile)
        );

        this.files.push(...preloadedFiles);
        this.updateInputFiles();

        if (this.config.preview) {
            for (let i = 0; i < preloadedFiles.length; i++) {
                const imageDataUrl = srcList[i];
                const file = preloadedFiles[i];
            
                const picWrapper = this.config.preview.cloneNode(true);
                picWrapper.querySelector('img').src = imageDataUrl;
            
                const removeBtn = picWrapper.querySelector('.js-post-pic-delete');
                removeBtn.addEventListener('click', () => this.removeFile(file, picWrapper));
            
                this.parent.insertBefore(picWrapper, this.config.imitator);
            }
        }
    }

    async fetchImageAsFile(src: any) {
        const response = await fetch(src);
        const blob = await response.blob();
        const filename = src.split('/').pop().split('?')[0] || 'image.jpg';
        return new File([blob], filename, { type: blob.type });
    }

    private async resizeImage(file: File, maxSize: number = this.config.maxSize ?? 1680): Promise<File> {
        const imageBitmap = await createImageBitmap(file);
        const { width, height } = imageBitmap;
    
        const scale = Math.min(maxSize / width, maxSize / height, 1);
        const newWidth = Math.round(width * scale);
        const newHeight = Math.round(height * scale);
    
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
    
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Cannot get canvas context');
    
        ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);
    
        return new Promise((resolve) => {
            canvas.toBlob(blob => {
                if (!blob) throw new Error('Canvas toBlob failed');
                const compressedFile = new File([blob], file.name, { type: file.type });
                resolve(compressedFile);
            }, file.type);
        });
    }    

    async multipleOnchange(event: any) {
        const newFiles: Array<File> = Array.from(event.target.files);
    
        const maxCount = this.config.maxCount ?? Infinity;
        const remainingSlots = maxCount - this.files.length;
        if (remainingSlots <= 0) return;

        let acceptedFiles = newFiles.slice(0, remainingSlots);
        if (this.config.compress) {
            acceptedFiles = await Promise.all(
                acceptedFiles.map(file => this.resizeImage(file))
            );
        }

        this.files.push(...acceptedFiles);
    
        const imageDataUrls = await Promise.all(acceptedFiles.map(this.readImageFile));
        for (let i = 0; i < imageDataUrls.length; i++) {
            const imageDataUrl = imageDataUrls[i];
            const file = acceptedFiles[i];
    
            const picWrapper = this.config.preview.cloneNode(true);
            picWrapper.querySelector('img').src = imageDataUrl;
    
            const removeBtn = picWrapper.querySelector('.js-post-pic-delete');
            removeBtn.addEventListener('click', () => this.removeFile(file, picWrapper));
    
            this.parent.insertBefore(picWrapper, this.config.imitator);
        }
    
        this.updateInputFiles();
    
        this.input.disabled = this.files.length >= maxCount;
        this.triggerReady();
    }

    async removeFile(fileToRemove: File, wrapper: HTMLElement) {
        this.files = this.files.filter(file => file !== fileToRemove);
        this.updateInputFiles();
        wrapper.remove();
    
        if (!this.input) return;
    
        const maxCount = this.config.maxCount ?? Infinity;
        this.input.disabled = this.files.length >= maxCount;
    
        this.input.value = '';

        const event = new Event('change', { bubbles: true });
        this.input.dispatchEvent(event);
    }
    




    
    addListener(listener: any) {
        if (!this.input) return;
        this.input.addEventListener('change', () => {
            this.onReady(listener);
        });
    }

    getFiles() {
        return this.files;
    }

    isValid() {
        if (!this.required) return true;
        return this.files.length > 0;
    }

    onReady(callback: () => void) {
        this.readyCallbacks.push(callback);
    }

    private triggerReady() {
        this.readyCallbacks.forEach(cb => cb());
    }
}
