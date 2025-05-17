import createElement from '@utils/createElement';

export default class IFrameComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    iframe: HTMLIFrameElement | null = null;
    private resizeObserver: ResizeObserver | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.config = config;
        this.parent = parent;
        this.render();
    }

    async render() {
        const currentIframe = this.parent.querySelector('iframe');
        if (currentIframe?.getAttribute('src') === this.config.src) return;

        this.iframe = createElement({
            tag: 'iframe',
            classes: ['iframe'],
            parent: this.parent,
            attrs: {
                src: this.config.src,
            },
        }) as HTMLIFrameElement;

        this.iframe.addEventListener('load', () => {
            const doc = this.iframe?.contentDocument;
            if (!doc) return;
        
            // Периодически проверяем, появился ли нужный элемент
            const waitForContainer = () => {
                const container = doc.querySelector('.container_scores') as HTMLElement | null;
                if (container && container.children.length) {
                    this.setupWithContainer(container);
                } else {
                    // Повторить проверку через requestAnimationFrame (или setTimeout)
                    requestAnimationFrame(waitForContainer);
                }
            };
        
            waitForContainer();
        });        
    }

    private setupWithContainer(container: HTMLElement) {
        const content = container.children[0] as HTMLElement;
    
        this.updateIframeSize(content);
    
        this.resizeObserver = new ResizeObserver(() => {
            this.updateIframeSize(content);
        });
        this.resizeObserver.observe(content);
    
        const observer = new MutationObserver(() => {
            if (!container.children.length) {
                this.iframe?.remove();
                this.disconnectObservers();
            }
        });
        observer.observe(container, {
            attributes: false,
            childList: true,
            subtree: true,
        });
    }    

    private updateIframeSize(content: HTMLElement) {
        if (!this.iframe) return;
        this.iframe.style.width = `${content.clientWidth}px`;
        this.iframe.style.height = `${content.clientHeight}px`;
    }

    private disconnectObservers() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }
}
