import Ajax from '../../modules/ajax.js';
import PostComponent from '../../Components/PostComponent/PostComponent.js';

export default class FeedView {
    constructor(menu) {
        this.menu = menu;
        this.formWrapper = document.createElement('div');
    }

    render() {
        const feed = document.createElement('div');
        feed.classList.add('feed');

        const feedLeft = document.createElement('div');
        feedLeft.classList.add('feed-left');
        feed.appendChild(feedLeft);

        const feedFilter = document.createElement('div');
        feedFilter.classList.add('feed-filter');
        feed.appendChild(feedFilter);

        const filterCategories = {
            'Лента': {},
            'Рекомендации': {},
            'Комментарии': {},
            'Реакции': {},
        }

        Object.entries(filterCategories).forEach(([key,],) => {
            const filterCategory = document.createElement('div');
            filterCategory.classList.add('feed-filter-category');
            filterCategory.textContent = key;
            feedFilter.appendChild(filterCategory);
        });

        const createPostBtn = document.createElement('button');
        createPostBtn.classList.add('post-create-btn');
        createPostBtn.textContent = 'Создать пост';
        feedLeft.appendChild(createPostBtn);

        const postsWrapper = document.createElement('div');
        postsWrapper.classList.add('feed-posts-wrapper');
        feedLeft.appendChild(postsWrapper);

        Ajax.get({
            url: '/feed',
            params: {
                posts_count: 10
            },
            callback: (status, feedData) => {
                let isAuthorized = status === 200;

                if (!isAuthorized) {
                    this.menu.goToPage(this.menu.menuElements.login);
                    this.menu.updateMenuVisibility(false);
                    return;
                }

                if (feedData && Array.isArray(feedData)) {
                    feedData.forEach(({ id, creator_id, text, pics, created_at, like_count, repost_count, comment_count }) => {
                        new PostComponent(postsWrapper, {
                            id,
                            creator_id,
                            text,
                            pics,
                            created_at,
                            like_count,
                            repost_count,
                            comment_count,
                        });
                    });
                }
            }
        });

        // Обработчик лайков на постах
        feed.addEventListener('click', (event) => {
            if (event.target.tagName.toLowerCase() === 'button' && event.target.dataset.imageId) {
                const { imageId: id } = event.target.dataset;

                Ajax.post({
                    url: '/like',
                    body: { id },
                    callback: (status) => {
                        if (status === 200) {
                            const likeContainer = event.target.parentNode;
                            const likeCount = likeContainer.querySelector('span');
                            likeCount.textContent = `${parseInt(likeCount.textContent) + 1} лайков`;
                        } else if (status === 500) {
                            // TODO: дописать обработку ошибки + ретрай
                        }
                    }
                });
            }
        });

        return feed;
    }
}
