type FetchFunction<T> = () => Promise<T[]>;
type RenderFunction<T> = (items: T[]) => void;

interface ExtraLoadConfig<T> {
    fetchFn: FetchFunction<T>;
    renderFn: RenderFunction<T>;
    marginPx?: number;
    sentinelContainer: HTMLElement;
}

export default class ExtraLoadComponent<T> {
    private config: ExtraLoadConfig<T>;
    private sentinel: HTMLElement;
    private isLoading = false;
    private endOfList = false;
    private observer: IntersectionObserver;

    constructor(config: ExtraLoadConfig<T>) {
        this.config = config;
        this.sentinel = document.createElement('div');
        this.sentinel.classList.add('extra-load-sentinel');
        this.config.sentinelContainer.appendChild(this.sentinel);
        this.initObserver();
    }

    private initObserver() {
        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
            rootMargin: `${this.config.marginPx ?? 300}px`,
        });
        this.observer.observe(this.sentinel);
    }

    private async handleIntersect(entries: IntersectionObserverEntry[]) {
        if (!entries[0].isIntersecting || this.isLoading || this.endOfList) return;

        this.isLoading = true;

        try {
            const items = await this.config.fetchFn();
            if (items.length === 0) {
                this.endOfList = true;
                this.sentinel.remove();
                this.observer.disconnect();
                return;
            }

            this.config.renderFn(items);
            this.config.sentinelContainer.appendChild(this.sentinel); // переносим вниз
        } catch (e) {
            console.error('Failed to fetch extra items', e);
            this.endOfList = true;
            this.sentinel.remove();
            this.observer.disconnect();
        } finally {
            this.isLoading = false;
        }
    }
}
