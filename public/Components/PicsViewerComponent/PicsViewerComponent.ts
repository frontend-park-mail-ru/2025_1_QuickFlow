import SwiperComponent from '@components/SwiperComponent/SwiperComponent';
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

    private slider: HTMLElement | null = null;
    private swiper: SwiperComponent | null = null;

    constructor(config: PicsViewerConfig<any>) {
        this.config = config;

        const array = Array.from(this.config.picsWrapper.querySelectorAll('img, video'));
        this.pics = array.map(img => img.cloneNode(true) as HTMLImageElement | HTMLVideoElement);
        this.currentIndex = array.indexOf(this.config.target);

        this.render();
        this.addBgClickHandler();
    }

    private render() {
        document.body.style.overflow = 'hidden';
        const parent = document.querySelector('.parent');

        this.wrapper = createElement({
            parent: parent as HTMLElement,
            classes: ['pics-viewer__wrapper'],
        });

        this.slider = createElement({
            parent: this.wrapper,
            classes: ['pics-viewer__slider'],
        });

        this.pics.forEach(media => this.renderSlide(media));

        this.swiper = new SwiperComponent(this.wrapper, {
            picsWrapper: this.wrapper,
            picsCount: this.pics.length,
            slider: this.slider,
            hasPaginator: true,
            isHandlingMouse: true,
            isHandlingTouch: true,
        });
        this.swiper.showSlide(this.currentIndex);

        this.handleKeydownBinded = this.handleKeydown.bind(this);
        document.addEventListener('keydown', this.handleKeydownBinded);
        this.addBgClickHandler();
    }

    private renderSlide(media: HTMLImageElement | HTMLVideoElement) {
        const bg = createElement({
            parent: this.slider,
            classes: ['pics-viewer__bg'],
        });

        const element = createElement({
            parent: bg,
            classes: ['pics-viewer'],
        });

        media.classList.value = 'pics-viewer__pic';
        element.appendChild(media);

        if (media instanceof HTMLVideoElement) {
            media.loop = true;
            media.muted = true;
            media.controls = true;

            media.addEventListener('loadeddata', () => {
                media.play();
            });

            media.load();
        }
    }

    private handleKeydown(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowRight':
                this.swiper.next();
                break;
            case 'ArrowLeft':
                this.swiper.prev();
                break;
            case 'Escape':
            case ' ':
                e.preventDefault();
                this.close();
                return;
        }
    }

    protected addBgClickHandler() {
        if (!this.wrapper) {
            return;
        }

        this.wrapper.addEventListener('click', (e) => {
            if ((e.target as Element).classList.contains('pics-viewer')) {
                this.close();
            }
        });
    }

    public close() {
        if (!this.wrapper) {
            return;
        }
        
        this.wrapper.remove();
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', this.handleKeydownBinded);

        delete this.wrapper;
        delete this.element;
        delete this.pics;
        delete this.config;
    }
}
