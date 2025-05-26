import createElement from '@utils/createElement';
import { Attachment } from 'types/UploadTypes';


const DEFAULT_TYPE = 'file';
const DEFAULT_NAME = '';
const DEFAULT_ACCEPT_IMAGE = '.jpg, .jpeg, .png, .gif';


interface FileInputConfig {
    imitator: HTMLElement;
    id: string;
    maxSize: number;

    preview?: any;
    renderPreview?: (file: File, imageDataUrl: string) => HTMLElement;
    compress?: boolean;
    maxResolution?: number;
    maxSizeSingle?: number;
    multiple?: boolean;
    required?: boolean;
    maxCount?: number;
    accept?: string;
    insertPosition?: string;
    name?: string;
    classes?: string[];
    onUpload?: () => void;
    preloaded?: string[] | Attachment[];
};


export default class FileInputComponent {
    private parent: HTMLElement;
    private config: FileInputConfig;
    private files: Array<File> = [];
    private readyCallbacks: Array<() => void> = [];

    input: HTMLInputElement | null = null;

    constructor(parent: HTMLElement, config: FileInputConfig) {
        this.config = config;
        this.parent = parent;
        this.render();
    }

    get name(): string {
        return this.config.name?.trim();
    }

    get size(): number {
        const files = this.value;

        if (files instanceof File) {
            return files.size;
        }

        let totalSize: number = 0;
        for (const file of files) {
            totalSize += file.size;
        }

        return totalSize;
    }

    get isLarge(): boolean {
        if (this.config)
        return this.size > this.config.maxSize;
    }

    get isAnyLarge(): boolean {
        const files = this.value;

        if (files instanceof File) {
            return files.size > this.config.maxSizeSingle;
        }

        for (const file of files) {
            if (file.size > this.config.maxSizeSingle) {
                return true;
            }
        }

        return false;
    }

    isValid(): boolean {
        if (!this.required) return true;
        return this.files.length > 0;
    }

    get value(): File | FileList {
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

    async render() {
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
        
        if (this.config.preview || this.config.renderPreview) {
            this.input.onchange = async (event) => {
                try {
                    await this.config.multiple ? this.multipleOnchange(event) : this.singleOnchange(event);
                    this.config.onUpload ? this.config.onUpload() : null;
                } catch (error) {
                    console.error("Ошибка при чтении файла", error);
                }
            };
        }

        if (Array.isArray(this.config.preloaded) && this.config.preloaded.length) {
            this.loadPreloadedFiles(this.config.preloaded);
        }
    }

    async singleOnchange(event: any) {
        this.files = [];
        let file = event.target.files[0];
        if (this.config.compress && file.type.startsWith('image/')) {
            file = await this.resizeImage(file);
        }

        this.files.push(file);
        this.updateInputFiles();

        const imageDataUrl = await this.readFileAsDataURL(file);

        if (this.config.renderPreview) {
            this.config.renderPreview(file, imageDataUrl);
        } else {
            this.createPreviewElement(file, imageDataUrl);
        }

        this.triggerReady();
    }

    async multipleOnchange(event: any) {
        const newFiles: Array<File> = Array.from(event.target.files);
    
        const maxCount = this.config.maxCount ?? Infinity;
        const remainingSlots = maxCount - this.files.length;
        if (remainingSlots <= 0) return;

        let acceptedFiles = newFiles.slice(0, remainingSlots);
        if (this.config.compress) {
            acceptedFiles = await Promise.all(
                acceptedFiles.map(file =>
                    file.type.startsWith('image/') ? this.resizeImage(file) : file
                )
            );
        }
        
        this.files.push(...acceptedFiles);
    
        const imageDataUrls = await Promise.all(acceptedFiles.map(this.readFileAsDataURL));
        for (let i = 0; i < imageDataUrls.length; i++) {
            const file = acceptedFiles[i];
            const dataUrl = imageDataUrls[i];

            let wrapper: HTMLElement;
            if (this.config.renderPreview) {
                wrapper = this.config.renderPreview(file, dataUrl);
            } else {
                wrapper = this.createPreviewElement(file, dataUrl);
            }

            if (this.config?.insertPosition === 'end') {
                this.parent.appendChild(wrapper);
            } else {
                this.parent.insertBefore(wrapper, this.config.imitator);
            }
        }        
    
        this.updateInputFiles();
    
        this.input.disabled = this.files.length >= maxCount;
        this.triggerReady();
    }

    createPreviewElement(file: File, dataUrl: string): HTMLElement {
        if (!this.config.multiple) {
            this.config.preview.src = dataUrl;
            return this.config.preview;
        }
        
        const picWrapper = this.config.preview.cloneNode(true);
        picWrapper.querySelector('img').src = dataUrl;

        const removeBtn = picWrapper.querySelector('.js-post-pic-delete');
        removeBtn.addEventListener('click', () => this.removeFile(file, picWrapper));

        return picWrapper;
    }

    async readFileAsDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (!event.target) return reject('Empty result');
                resolve(event.target.result as string);
            };
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

    async loadPreloadedFiles(srcList: string[] | Attachment[]) {
        const results = await Promise.allSettled(srcList.map(this.fetchImageAsFile));

        const preloadedFiles: File[] = [];
        const imageDataUrls: string[] = [];
    
        results.forEach((result, i) => {
            if (result.status === 'fulfilled' && result.value) {
                preloadedFiles.push(result.value);
                if (typeof srcList[i] === 'string') {
                    imageDataUrls.push(srcList[i]);
                } else {
                    imageDataUrls.push(srcList[i].url);
                }
            } else {
                console.warn(`Не удалось загрузить файл: ${srcList[i]}`);
            }
        });

        this.files.push(...preloadedFiles);
        this.updateInputFiles();

        if (this.config.preview || this.config.renderPreview) {
            for (let i = 0; i < preloadedFiles.length; i++) {
                const src = srcList[i];
                const imageDataUrl = typeof src === 'string' ? src : src.url;
                const file = preloadedFiles[i];

                let wrapper: HTMLElement;
                if (this.config.renderPreview) {
                    wrapper = this.config.renderPreview(file, imageDataUrl);
                } else {
                    wrapper = this.createPreviewElement(file, imageDataUrl);
                }
                
                if (this.parent === this.config.imitator.parentElement) {
                    this.parent.insertBefore(wrapper, this.config.imitator);
                } else {
                    this.parent.append(wrapper);
                }
            }
        }
    }

    async fetchImageAsFile(src: string | Attachment) {
        try {
            let response: Response, filename: string;

            if (typeof src === 'string') {
                response = await fetch(src);
                filename = src.split('/').pop().split('?')[0] || 'image.jpg';
            } else {
                response = await fetch(src.url);
                filename = src.name;
            }

            const blob = await response.blob();
            return new File([blob], filename, { type: blob.type });
        } catch (error) {
            console.error("Ошибка при чтении файла", error);
        }
    }

    private async resizeImage(file: File, maxResolution: number = this.config.maxResolution ?? 1680): Promise<File> {
        if (file.type === 'image/gif') {
            return file;
        }

        const imageBitmap = await createImageBitmap(file);
        const { width, height } = imageBitmap;
    
        const scale = Math.min(maxResolution / width, maxResolution / height, 1);
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

    public async removeFile(fileToRemove: File, wrapper: HTMLElement) {
        this.files = this.files.filter(file => file !== fileToRemove);
        this.updateInputFiles();
        wrapper.remove();
    
        if (!this.input) {
            return;
        }
    
        const maxCount = this.config.maxCount ?? Infinity;
        this.input.disabled = this.files.length >= maxCount;
    
        this.input.value = '';

        const event = new Event('change', { bubbles: true });
        this.input.dispatchEvent(event);
    }

    public clear() {
        this.files = [];
        this.updateInputFiles();

        if (!this.input) {
            return;
        }
    
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

    onReady(callback: () => void) {
        this.readyCallbacks.push(callback);
    }

    private triggerReady() {
        this.readyCallbacks.forEach(cb => cb());
    }
}
