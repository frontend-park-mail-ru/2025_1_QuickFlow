import Ajax from '../../modules/ajax.js';
import PostComponent from '../../Components/PostComponent/PostComponent.js';
import ModalWindowComponent from '../../Components/UI/ModalWindowComponent/ModalWindowComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';

import createElement from '../../utils/createElement.js';

export default class FeedView {
    constructor(menu) {
        this.menu = menu;
    }

    render() {
        const containerObj = new MainLayoutComponent({
            type: 'feed',
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

        const createPostBtn = createElement({
            parent: containerObj.left,
            tag: 'button',
            classes: ['post-create-btn']
        });
        createElement({
            parent: createPostBtn,
            tag: 'div',
            classes: ['post-create-icon']
        });
        createElement({
            parent: createPostBtn,
            text: 'Создать пост',
            classes: ['post-create-text']
        });

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
