import Ajax from '../../modules/ajax.js';
import PostComponent from '../../Components/PostComponent/PostComponent.js';
import ModalWindowComponent from '../../Components/UI/ModalWindowComponent/ModalWindowComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';

export default class FeedView {
    constructor(menu) {
        this.menu = menu;
    }

    render() {
        const containerObj = new MainLayoutComponent({
            type: 'default',
        });

        const feedFilter = document.createElement('div');
        feedFilter.classList.add('feed-filter');
        containerObj.right.appendChild(feedFilter);

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
        containerObj.left.appendChild(createPostBtn);

        const createPostIcon = document.createElement('img');
        createPostIcon.classList.add('post-create-icon');
        createPostIcon.src = '/static/img/add-icon.svg';
        createPostBtn.appendChild(createPostIcon);

        const createPostText = document.createElement('div');
        createPostText.classList.add('post-create-text');
        createPostText.textContent = 'Создать пост';
        createPostBtn.appendChild(createPostText);

        const postsWrapper = document.createElement('div');
        postsWrapper.classList.add('feed-posts-wrapper');
        containerObj.left.appendChild(postsWrapper);

        createPostBtn.addEventListener('click', () => {
            new ModalWindowComponent(containerObj.container, {
                type: 'create-post',
            });
        });

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

        return containerObj.container;
    }
}
