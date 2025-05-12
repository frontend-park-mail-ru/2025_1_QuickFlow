import Ajax from '@modules/ajax';
import PostComponent from '@components/PostComponent/PostComponent';
import PostMwComponent from '@components/UI/ModalWindowComponent/PostMwComponent';
import createElement from '@utils/createElement';
import router from '@router';
import insertIcon from '@utils/insertIcon';
import { getLsItem } from '@utils/localStorage'
import IFrameComponent from '@components/UI/IFrameComponent/IFrameComponent';
import ExtraLoadComponent from '@components/ExtraLoadComponent/ExtraLoadComponent';
import VirtualizedListComponent from '@components/VirtualizedListComponent/VirtualizedListComponent';


const POSTS_COUNT = 10;
const OBSERVER_MARGIN = 500;


export default class FeedComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private posts: HTMLElement | null = null;
    private lastTs: string | null = null;
    private emptyWrapper: HTMLElement;

    private virtualization!: VirtualizedListComponent<any>;
    private postKeyMap: Map<string, any> = new Map();

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
        this.getPosts();
    }

    private getPosts() {
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

    // private renderPost(config: any, position: string | null = null) {
    //     if (position) config.position = "top";
    //     new PostComponent(this.posts, config);
    // }

    private renderPost(config: any, position: string | null = null): HTMLElement {
        const key = config.id; // предполагаем, что post_id уникален
        if (!key) return;
    
        if (position) config.position = "top";
    
        this.postKeyMap.set(String(key), config); // сохраняем config по ключу
        new PostComponent(this.posts, config);

        return this.posts.querySelector(`[data-id="${config.id}"]`);
    }
    

    private cbOk(feedData: any) {
        let newPostsHeight = -48;

        feedData?.forEach((config: Record<string, any>) => {
            const post = this.renderPost(config);
            this.lastTs = config.created_at;
            newPostsHeight += post.offsetHeight + 48;
        });

        this.initVirtualization(newPostsHeight);

        new ExtraLoadComponent<any>({
            sentinelContainer: this.posts!,
            marginPx: OBSERVER_MARGIN,
            position: 'pre-bottom',
            fetchFn: this.fetchMorePosts.bind(this),
            renderFn: (posts) => {
                let newPostsHeight = -48;

                const postsElements: Array<HTMLElement> = [];
                posts?.forEach((postConfig) => {
                    const post = this.renderPost(postConfig);
                    this.lastTs = postConfig.created_at;
                    newPostsHeight += post.offsetHeight + 48;
                    postsElements.push(post);
                });

                // this.virtualization?.destroy(); // пересоздаем виртуализацию
                this.virtualization.pushElements(postsElements);
                // this.initVirtualization(newPostsHeight);
            }
        });
    }

    private initVirtualization(newPostsHeight: number) {
        if (!this.posts) return;
    
        this.virtualization?.destroy();
    
        this.virtualization = new VirtualizedListComponent<any>({
            container: this.posts,
            itemSelector: '.post',
            virtualizeMargin: newPostsHeight,
            getKey: (el) => el.getAttribute('data-id')!,
            fetchRenderedItem: (key) => {
                const config = this.postKeyMap.get(key);
                if (!config) return document.createElement('div');
    
                const wrapper = document.createElement('div');
                new PostComponent(wrapper, config);
                const el = wrapper.firstElementChild as HTMLElement;
                return el;
            },
        });
    }    

    private async fetchMorePosts(): Promise<any[]> {
        if (!this.lastTs) return [];

        return new Promise((resolve) => {
            Ajax.get({
                url: this.config.getUrl,
                params: {
                    posts_count: POSTS_COUNT,
                    ts: this.lastTs,
                },
                callback: (status: number, data: any) => {
                    if (status === 200 && Array.isArray(data)) {
                        resolve(data);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
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
}
