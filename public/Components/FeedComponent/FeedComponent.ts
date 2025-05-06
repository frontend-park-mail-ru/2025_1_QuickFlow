import Ajax from '@modules/ajax';
import PostComponent from '@components/PostComponent/PostComponent';
import PostMwComponent from '@components/UI/ModalWindowComponent/PostMwComponent';
import createElement from '@utils/createElement';
import router from '@router';
import insertIcon from '@utils/insertIcon';
import { getLsItem } from '@utils/localStorage'
import IFrameComponent from '@components/UI/IFrameComponent/IFrameComponent';


const POSTS_COUNT = 10;
const OBSERVER_MARGIN = 500;


export default class FeedComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private posts: HTMLElement | null = null;
    private isLoading: Boolean = false;
    private endOfFeed: Boolean = false;
    private lastTs: string | null = null;
    private sentinel: HTMLElement | null = null;
    private emptyWrapper: HTMLElement;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
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
        const observer = new MutationObserver(() => {
            if (this.hasPosts())
                return this.emptyWrapper.remove();

            if (!this.posts.contains(this.emptyWrapper))
                this.posts.prepend(this.emptyWrapper);
        });
        
        observer.observe(this.posts, {
            attributes: false,
            childList: true,
            subtree: false,
        });
    }

    private renderCreateButton() {
        if (!this.config.hasCreateButton) return;

        const createPostBtn = createElement({
            parent: this.parent,
            tag: 'button',
            classes: ['button_feed']
        });

        insertIcon(createPostBtn, {
            name: 'add-icon',
            classes: ['button_feed__icon']
        });
        
        createElement({
            parent: createPostBtn,
            text: 'Создать пост',
        });

        createPostBtn.addEventListener('click', () => {
            console.log(this.config.params);
            new PostMwComponent(this.parent.parentNode as HTMLElement, {
                type: 'create-post',
                target: this.config?.params?.author_id ? 'community' : '',
                params: this.config.params,
                renderCreatedPost: (config: any) => {
                    this.renderPost(config, "top");

                    if (getLsItem('is-post-feedback-given', 'false') === 'false') {
                        new IFrameComponent(this.parent.parentNode as HTMLElement, {
                            src: '/scores?type=post',
                        });
                    }
                },
            });
        });
    }

    private cbUnauthorized() {
        router.go({ path: '/login' });
    }

    private renderPost(config: any, position: string | null = null) {
        if (position) config.position = "top";
        new PostComponent(this.posts, config);
    }

    private cbOk(feedData: any) {
        feedData?.forEach((config: Record<string, any>) => {
            this.renderPost(config);
            this.lastTs = config.created_at;
        });

        this.sentinel = createElement({
            parent: this.posts,
            classes: ['feed__bottom-sentinel'],
        });

        this.createIntersectionObserver();
    }

    private renderEmptyState() {
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

    private createIntersectionObserver() {
        if (!this.sentinel) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !this.isLoading && !this.endOfFeed) {
                this.loadMorePosts();
            }
        }, {
            rootMargin: `${OBSERVER_MARGIN}px`,
        });
    
        observer.observe(this.sentinel);
    }
    
    private loadMorePosts() {
        if (!this.lastTs) return;

        this.isLoading = true;
    
        Ajax.get({
            url: this.config.getUrl,
            params: {
                posts_count: POSTS_COUNT,
                ts: this.lastTs,
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

    private extraLoadCbOk(feedData: any) {
        if (!this.posts || !this.sentinel) return;

        if (Array.isArray(feedData) && feedData.length > 0) {
            feedData.forEach((config) => {
                this.renderPost(config);
                this.lastTs = config.created_at;
            });
            this.posts.appendChild(this.sentinel);
            return;
        }

        this.endOfFeed = true;
        this.sentinel.remove();
    }
}
