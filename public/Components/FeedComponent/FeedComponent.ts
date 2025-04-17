import Ajax from '@modules/ajax';
import PostComponent from '@components/PostComponent/PostComponent';
import ModalWindowComponent from '@components/UI/ModalWindowComponent/ModalWindowComponent';
import createElement from '@utils/createElement';
import router from '@router';


const POSTS_COUNT = 10;
const OBSERVER_MARGIN = 500;


export default class FeedComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private posts: HTMLElement | null = null;
    private isLoading: Boolean = false;
    private endOfFeed: Boolean = false;
    #lastTs: string | null = null;
    sentinel: HTMLElement | null = null;
    private emptyWrapper: HTMLElement;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {
        this.renderCreateButton();

        this.posts = createElement({
            parent: this.parent,
            classes: ['feed__posts'],
        });

        this.renderEmptyState();
        this.createMutationObserver();

        Ajax.get({
            url: this.config.getUrl,
            params: { posts_count: POSTS_COUNT },
            callback: (status: number, feedData: any) => {
                switch (status) {
                    case 200:
                        this.cbOk(feedData);
                        break;
                    case 401:
                        this.cbUnauthorized();
                        break;
                }
            }
        });
    }

    private hasPosts(): boolean {
        return this.posts?.querySelectorAll('.post')?.length > 0;
    }

    private createMutationObserver() {
        // const observer = new MutationObserver(() => {
        //     if (this.posts.hasChildNodes())
        //         return this.emptyWrapper.remove();
        //     return this.posts.appendChild(this.emptyWrapper);
        // });

        const observer = new MutationObserver(() => {
            if (this.hasPosts())
                return this.emptyWrapper.remove();

            if (!this.posts.contains(this.emptyWrapper))
                this.posts.appendChild(this.emptyWrapper);
        });
        
        observer.observe(this.posts, {
            attributes: true,
            childList: true,
            subtree: true
        });
    }

    private renderCreateButton() {
        if (!this.config.hasCreateButton) return;

        const createPostBtn = createElement({
            parent: this.parent,
            tag: 'button',
            classes: ['button_feed']
        });
        createElement({
            parent: createPostBtn,
            tag: 'div',
            classes: ['button_feed__icon']
        });
        createElement({
            parent: createPostBtn,
            text: 'Создать пост',
        });
        createPostBtn.addEventListener('click', () => {
            new ModalWindowComponent(this.parent.parentNode, {
                type: 'create-post',
                renderCreatedPost: (config: any) => this.renderPost(config, "top"),
            });
        });
    }

    cbUnauthorized() {
        router.go({ path: '/login' });
    }

    renderPost(config: any, position: string | null = null) {
        if (position) config.position = "top";
        new PostComponent(this.posts, config);
    }

    cbOk(feedData: any) {
        feedData?.forEach((config: Record<string, any>) => {
            this.renderPost(config);
            this.#lastTs = config.created_at;
        });

        this.sentinel = createElement({
            parent: this.posts,
            classes: ['feed__bottom-sentinel'],
        });

        this.#createIntersectionObserver();
    }

    renderEmptyState() {
        this.emptyWrapper = createElement({
            parent: this.posts,
            classes: ['feed__empty'],
        });
        createElement({
            parent: this.emptyWrapper,
            classes: ['feed__empty-icon'],
            attrs: { src: "/static/img/feed-primary-icon.svg" },
        });
        createElement({
            parent: this.emptyWrapper,
            classes: ['feed__empty-text'],
            text: this.config.emptyStateText,
        });
    }

    #createIntersectionObserver() {
        if (!this.sentinel) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !this.isLoading && !this.endOfFeed) {
                this.#loadMorePosts();
            }
        }, {
            rootMargin: `${OBSERVER_MARGIN}px`,
        });
    
        observer.observe(this.sentinel);
    }
    
    #loadMorePosts() {
        if (!this.#lastTs) return;

        this.isLoading = true;
    
        Ajax.get({
            url: this.config.getUrl,
            params: {
                posts_count: POSTS_COUNT,
                ts: this.#lastTs,
            },
            callback: (status: number, feedData: any) => {
                this.isLoading = false;

                switch (status) {
                    case 200:
                        this.extraLoadCbOk(feedData);
                        break;
                    default:
                        this.endOfFeed = true;
                        if (this.sentinel) this.sentinel.remove();
                        break;
                }
            }
        });
    }    

    extraLoadCbOk(feedData: any) {
        if (!this.posts || !this.sentinel) return;

        if (Array.isArray(feedData) && feedData.length > 0) {
            feedData.forEach((config) => {
                this.renderPost(config);
                this.#lastTs = config.created_at;
            });
            this.posts.appendChild(this.sentinel);
            return;
        }

        this.endOfFeed = true;
        this.sentinel.remove();
    }
}
