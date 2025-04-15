import Ajax from '../../modules/ajax.js';
import PostComponent from '../../Components/PostComponent/PostComponent.js';
import ModalWindowComponent from '../../Components/UI/ModalWindowComponent/ModalWindowComponent.js';
import createElement from '../../utils/createElement.js';
import router from '../../Router.js';


const POSTS_COUNT = 10;
const OBSERVER_MARGIN = 500;


export default class FeedView {
    #parent;
    #config;
    #posts = [];
    #isLoading = false;
    #endOfFeed = false;
    #lastTs = null;
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;
        this.render();
    }

    render() {
        if (this.#config.hasCreateButton) {
            const createPostBtn = createElement({
                parent: this.#parent,
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
                new ModalWindowComponent(this.#parent.parentNode, {
                    type: 'create-post',
                });
            });
        }

        this.#posts = createElement({
            parent: this.#parent,
            classes: ['feed__posts'],
        });

        Ajax.get({
            url: this.#config.getUrl,
            params: { posts_count: POSTS_COUNT },
            callback: (status, feedData) => {
                switch (status) {
                    case 401:
                        this.cbUnauthorized();
                        break;
                    case 200:
                        this.cbOk(feedData);
                        break;
                }
            }
        });
    }

    cbUnauthorized() {
        router.go({ path: '/login' });
    }

    cbOk(feedData) {
        if (feedData && Array.isArray(feedData) && feedData.length > 0) {
            feedData.forEach((config) => {
                config.container = this.#parent.parentNode;
                new PostComponent(this.#posts, config);
                this.#lastTs = config.created_at;
            });

            this.sentinel = createElement({
                parent: this.#posts,
                classes: ['feed__bottom-sentinel'],
            });
            this.#createIntersectionObserver();
            return;
        }
        this.renderEmptyState();
    }

    renderEmptyState() {
        const emptyWrapper = createElement({
            parent: this.#posts,
            classes: ['feed__empty'],
        });
        createElement({
            parent: emptyWrapper,
            classes: ['feed__empty-icon'],
            attrs: { src: "/static/img/feed-primary-icon.svg" },
        });
        createElement({
            parent: emptyWrapper,
            classes: ['feed__empty-text'],
            text: this.#config.emptyStateText,
        });
    }

    #createIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !this.#isLoading && !this.#endOfFeed) {
                this.#loadMorePosts();
            }
        }, {
            rootMargin: `${OBSERVER_MARGIN}px`,
        });
    
        observer.observe(this.sentinel);
    }
    
    #loadMorePosts() {
        this.#isLoading = true;
    
        Ajax.get({
            url: this.#config.getUrl,
            params: {
                posts_count: POSTS_COUNT,
                ts: this.#lastTs,
            },
            callback: (status, feedData) => {
                this.#isLoading = false;

                switch (status) {
                    case 200:
                        this.extraLoadCbOk(feedData);
                        break;
                    default:
                        this.#endOfFeed = true;
                        this.sentinel.remove();
                        break;
                }
            }
        });
    }    

    extraLoadCbOk(feedData) {
        if (Array.isArray(feedData) && feedData.length > 0) {
            feedData.forEach((config) => {
                config.container = this.#parent.parentNode;
                new PostComponent(this.#posts, config);
                this.#lastTs = config.created_at;
            });
            this.#posts.appendChild(this.sentinel);
            return;
        }
        this.#endOfFeed = true;
        this.sentinel.remove();
    }
}
