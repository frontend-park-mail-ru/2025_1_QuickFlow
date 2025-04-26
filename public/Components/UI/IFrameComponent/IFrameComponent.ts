import createElement from '@utils/createElement';

export default class IFrameComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    iframe: HTMLIFrameElement | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private mutationObserver: MutationObserver | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.config = config;
        this.parent = parent;
        this.render();
    }

    render() {
        this.iframe = createElement({
            tag: 'iframe',
            classes: ['iframe'],
            parent: this.parent,
            attrs: {
                src: this.config.src,
            },
        }) as HTMLIFrameElement;

        this.iframe.addEventListener('load', () => {
            // Ждём один тик чтобы контент точно появился
            setTimeout(() => {
                try {
                    const doc = this.iframe?.contentDocument;
                    if (!doc) return;

                    const container = doc.querySelector('.container_scores') as HTMLElement | null;
                    if (!container || !container.children.length) return;

                    const content = container.children[0] as HTMLElement;

                    this.updateIframeSize(content);

                    // ResizeObserver следит за размерами контента
                    this.resizeObserver = new ResizeObserver(() => {
                        this.updateIframeSize(content);
                    });
                    this.resizeObserver.observe(content);

                    // MutationObserver следит за удалением дочерних элементов
                    this.mutationObserver = new MutationObserver(() => {
                        if (!container.children.length) {
                            this.removeIframe();
                        }
                    });
                    this.mutationObserver.observe(container, {
                        childList: true,
                        subtree: true,
                    });

                } catch (error) {
                    console.error('Ошибка при доступе к содержимому iframe:', error);
                }
            }, 0);
        });
    }

    private updateIframeSize(content: HTMLElement) {
        if (!this.iframe) return;
        this.iframe.style.width = `${content.scrollWidth}px`;
        this.iframe.style.height = `${content.scrollHeight}px`;
    }

    private removeIframe() {
        this.disconnectObservers();
        this.iframe?.remove();
        this.iframe = null;
    }

    private disconnectObservers() {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.mutationObserver?.disconnect();
        this.mutationObserver = null;
    }
}
