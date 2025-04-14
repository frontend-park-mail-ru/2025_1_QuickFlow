import Ajax from '../../modules/ajax.js';
import PostComponent from '../../Components/PostComponent/PostComponent.js';
// import ModalWindowComponent from '../../Components/UI/ModalWindowComponent/ModalWindowComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import RadioMenuComponent from '../../Components/RadioMenuComponent/RadioMenuComponent.js';
import FeedComponent from '../../Components/FeedComponent/FeedComponent.js';
import createElement from '../../utils/createElement.js';
import router from '../../Router.js';


const POSTS_COUNT = 10;


class FeedView {
    #containerObj = null;
    #isLoading = false;
    #endOfFeed = false;
    #lastTs = null;
    constructor() {
        this.posts = null;
    }

    render() {
        this.#containerObj = new MainLayoutComponent().render({
            type: 'feed',
        });

        new RadioMenuComponent(this.#containerObj.right, {
            items: {
                feed: {
                    title: 'Лента',
                    // onClick: () => this.renderSection('profile')
                },
                recommendations: {
                    title: 'Рекомендации',
                    // onClick: () => this.renderSection('contacts')
                },
                comments: {
                    title: 'Комментарии',
                    // onClick: () => this.renderSection('education')
                },
                reactions: {
                    title: 'Реакции',
                    // onClick: () => this.renderSection('education')
                },
            }
        });

        new FeedComponent(this.#containerObj.left, {});

        // const createPostBtn = createElement({
        //     parent: this.#containerObj.left,
        //     tag: 'button',
        //     classes: ['button_feed']
        // });
        // createElement({
        //     parent: createPostBtn,
        //     tag: 'div',
        //     classes: ['button_feed__icon']
        // });
        // createElement({
        //     parent: createPostBtn,
        //     text: 'Создать пост',
        // });

        // this.posts = createElement({
        //     parent: this.#containerObj.left,
        //     classes: ['feed__posts'],
        // });

        // createPostBtn.addEventListener('click', () => {
        //     new ModalWindowComponent(this.#containerObj.container, {
        //         type: 'create-post',
        //     });
        // });

        // Ajax.get({
        //     url: '/feed',
        //     params: {
        //         posts_count: POSTS_COUNT
        //     },
        //     callback: (status, feedData) => {
        //         switch (status) {
        //             case 401:
        //                 this.cbUnauthorized();
        //                 break;
        //             case 200:
        //                 this.cbOk(feedData);
        //                 break;
        //         }
        //     }
        // });

        // // Обработчик лайков на постах
        // feed.addEventListener('click', (event) => {
        //     if (event.target.tagName.toLowerCase() === 'button' && event.target.dataset.imageId) {
        //         const { imageId: id } = event.target.dataset;

        //         Ajax.post({
        //             url: '/like',
        //             body: { id },
        //             callback: (status) => {
        //                 if (status === 200) {
        //                     const likeContainer = event.target.parentNode;
        //                     const likeCount = likeContainer.querySelector('span');
        //                     likeCount.textContent = `${parseInt(likeCount.textContent) + 1} лайков`;
        //                 } else if (status === 500) {
        //                     // TODO: дописать обработку ошибки + ретрай
        //                 }
        //             }
        //         });
        //     }
        // });

        return this.#containerObj.container;
    }

    cbUnauthorized() {
        router.go({ path: '/login' });
    }

    cbOk(feedData) {
        if (feedData && Array.isArray(feedData)) {
            feedData.forEach((config) => {
                config.container = this.#containerObj.container;
                new PostComponent(this.posts, config);
                this.#lastTs = config.created_at;
            });

            this.sentinel = createElement({
                parent: this.posts,
                classes: ['feed__bottom-sentinel'],
            });
            this.#createIntersectionObserver();
        }
    }

    #createIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !this.#isLoading && !this.#endOfFeed) {
                this.#loadMorePosts();
            }
        }, {
            rootMargin: '100px',
        });
    
        observer.observe(this.sentinel);
    }
    
    #loadMorePosts() {
        this.#isLoading = true;
    
        Ajax.get({
            url: '/feed',
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
                config.container = this.#containerObj.container;
                new PostComponent(this.posts, config);
                this.#lastTs = config.created_at;
            });
            this.posts.appendChild(this.sentinel);
            return;
        }
        this.#endOfFeed = true;
        this.sentinel.remove();
    }
}

export default new FeedView();
