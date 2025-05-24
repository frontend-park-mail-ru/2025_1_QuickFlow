import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';


interface VideoConfig {
    src: string;
    classes?: string[];
    loop?: boolean;
    muted?: boolean;
    autoplay?: boolean;
    playsInline?: boolean;
}


export default class VideoComponent {
    private parent: HTMLElement;
    private config: VideoConfig;

    private loader: HTMLElement;
    public element: HTMLVideoElement;
    

    constructor(parent: HTMLElement, config: VideoConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        this.loader = createElement({
            parent: this.parent,
            classes: ['video__loader-bg'],
        });

        insertIcon(this.loader, {
            classes: ['video__loader'],
            name: 'logo-icon',
        });

        this.element = createElement({
            tag: 'video',
            parent: this.parent,
            attrs: { src: this.config.src },
        }) as HTMLVideoElement;

        if (this.config.classes.length) {
            this.element.classList.add(...this.config.classes);
        }
    
        this.element.loop = this.config?.loop ?? true;
        this.element.muted = this.config?.muted ?? true;
        this.element.autoplay = this.config?.autoplay ?? false;
        this.element.playsInline = this.config?.playsInline ?? false;
        this.element.poster = '';

        this.element.addEventListener('loadeddata', () => {
            this.loader.remove();
            if (this.config.autoplay) {
                this.element.play();
            }
        });
    }
}
