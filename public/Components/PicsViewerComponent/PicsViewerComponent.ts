import createElement from '@utils/createElement';


interface PicsViewerConfig<T> {
    picsWrapper: HTMLElement;
    target: HTMLImageElement | HTMLVideoElement;
}


export default class PicsViewerComponent {
    private config: PicsViewerConfig<any>;

    private pics: (HTMLImageElement | HTMLVideoElement)[];
    private currentIndex: number = 0;
    private handleKeydownBinded: (e: KeyboardEvent) => void;
    public wrapper: HTMLElement | null = null;
    public element: HTMLElement | null = null;

    constructor(config: PicsViewerConfig<any>) {
        this.config = config;

        const array = Array.from(this.config.picsWrapper.querySelectorAll('img, video'));
        this.pics = array.map(img => img.cloneNode(true) as HTMLImageElement | HTMLVideoElement);
        this.currentIndex = array.indexOf(this.config.target);

        this.render();
        this.addBgClickHandler();
    }

    render() {
        document.body.style.overflow = 'hidden';
        const parent = document.querySelector('.parent');

        this.wrapper = createElement({
            parent,
            classes: ['pics-viewer__bg'],
        });

        this.element = createElement({
            parent: this.wrapper,
            classes: ['pics-viewer'],
        });

        this.renderSlide();
        this.handleKeydownBinded = this.handleKeydown.bind(this);
        document.addEventListener('keydown', this.handleKeydownBinded);
    }

    private renderSlide() {
        this.element.innerHTML = '';
        
        const mediaItem = this.pics[this.currentIndex];
        mediaItem.classList.value = 'pics-viewer__pic';
        this.element.appendChild(mediaItem);

        if (mediaItem instanceof HTMLVideoElement) {
            mediaItem.loop = true;
            mediaItem.muted = true;
            mediaItem.controls = true;

            mediaItem.addEventListener('loadeddata', () => {
                mediaItem.play();
            });

            mediaItem.load();
        }
    }

    private handleKeydown(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowRight':
                if (this.currentIndex === this.pics.length - 1) return;
                this.currentIndex++;
                break;
            case 'ArrowLeft':
                if (!this.currentIndex) return;
                this.currentIndex--;
                break;
            case 'Escape':
            case ' ':
                e.preventDefault();
                return this.close();
        }

        this.renderSlide();
    }

    protected addBgClickHandler() {
        if (!this.wrapper || !this.element) return;

        this.wrapper.addEventListener('click', (e: MouseEvent) => {
            if (
                e.target === this.wrapper ||
                e.target === this.element
            ) {
                this.close();
            }
        });
    }

    close() {
        if (!this.wrapper) return;
        
        this.wrapper.remove();
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', this.handleKeydownBinded);

        delete this.wrapper;
        delete this.element;
        delete this.pics;
        delete this.config;
    }
}
