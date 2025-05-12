import createElement from '@utils/createElement';


interface PicsViewerConfig<T> {
    picsWrapper: HTMLElement;
}


export default class PicsViewerComponent {
    private config: PicsViewerConfig<any>;

    private pics: HTMLImageElement[];

    public wrapper: HTMLElement | null = null;
    public element: HTMLElement | null = null;

    constructor(config: PicsViewerConfig<any>) {
        this.config = config;
        this.pics = Array.from(this.config.picsWrapper.querySelectorAll('img')).map(img => img.cloneNode(true) as HTMLImageElement);


        this.handlePicsClick();
        this.render();
        this.addBgClickHandler();
    }

    render() {
        document.body.style.overflow = 'hidden';
        const parent = document.querySelector('.main');

        this.wrapper = createElement({
            parent,
            classes: ['pics-viewer__bg'],
        });

        this.element = createElement({
            parent: this.wrapper,
            classes: ['pics-viewer'],
        });

        for (const pic of this.pics) {
            pic.classList.value = 'pics-viewer__pic';
            this.element.appendChild(pic);
        }
    }

    private handlePicsClick() {
        for (const pic of this.pics) {
            pic.style.cursor = 'pointer';
            pic.addEventListener('click', () => {

            });
        }
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
    }
}
