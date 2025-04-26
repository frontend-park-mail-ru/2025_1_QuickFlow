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
            console.log('iframe loaded');
            setTimeout(() => {
                this.initObservers();
            }, 100); // Даем чуть больше времени контенту внутри iframe
        });
    }

    private initObservers() {
        const doc = this.iframe?.contentDocument;
        if (!doc) return;

        const trySetup = () => {
            const container = doc.querySelector('.container_scores') as HTMLElement | null;
            if (container && container.children.length) {
                console.log('Найден заполненный container_scores');

                const content = container.children[0] as HTMLElement;

                this.updateIframeSize(content);

                this.resizeObserver = new ResizeObserver(() => {
                    this.updateIframeSize(content);
                });
                this.resizeObserver.observe(content);

                this.mutationObserver?.disconnect(); // Остановить поиск
                this.setupEmptyObserver(container);  // Следим за очисткой контейнера
            }
        };

        this.mutationObserver = new MutationObserver(() => {
            console.log('Проверка наличия container_scores...');
            trySetup();
        });

        this.mutationObserver.observe(doc.body, {
            childList: true,
            subtree: true,
        });

        // На всякий случай первая попытка сразу
        trySetup();
    }

    private setupEmptyObserver(container: HTMLElement) {
        const emptyObserver = new MutationObserver(() => {
            console.log('Проверка очистки container_scores...');
            if (!container.children.length) {
                console.log('Контейнер пуст, удаляю iframe');
                this.removeIframe();
            }
        });

        emptyObserver.observe(container, {
            childList: true,
            subtree: true,
        });
    }

    private updateIframeSize(content: HTMLElement) {
        if (!this.iframe) return;
        this.iframe.style.width = `${content.clientWidth}px`;
        this.iframe.style.height = `${content.clientHeight}px`;
    }

    private removeIframe() {
        this.disconnectObservers();
        this.iframe?.remove();
        this.iframe = null;
    }

    private disconnectObservers() {
        this.resizeObserver?.disconnect();
        this.mutationObserver?.disconnect();
        this.resizeObserver = null;
        this.mutationObserver = null;
    }
}
