import createElement from "@utils/createElement";


interface ImageConfig {
    src: string;
    hasSkeleton: boolean;
    classes?: string[];
}


export default class ImageComponent {
    private parent: HTMLElement | null = null;
    private config: ImageConfig;

    public element: HTMLElement;

    constructor(parent: HTMLElement, config: ImageConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        this.element = createElement({
            parent: this.parent,
            classes: ['img__wrapper'],
        });

        const skeleton = createElement({
            parent: this.element,
            classes: ['img__skeleton'],
        });

        const img = createElement({
            parent: this.element,
            classes: ['img__img'],
            attrs: {
                src: this.config.src,
                loading: 'lazy'
            },
        });

        if (this.config?.classes?.length) {
            skeleton.classList.add(...this.config.classes);
            img.classList.add(...this.config.classes);
        }

        img.style.display = 'none';
        img.onload = () => {
            skeleton.remove();
            img.style.display = '';
            this.element.outerHTML = img.outerHTML;
        };
    }
}
