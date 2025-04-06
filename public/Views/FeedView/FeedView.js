import Ajax from '../../modules/ajax.js';
import PostComponent from '../../Components/PostComponent/PostComponent.js';
import ModalWindowComponent from '../../Components/UI/ModalWindowComponent/ModalWindowComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import RadioMenuComponent from '../../Components/RadioMenuComponent/RadioMenuComponent.js';
import createElement from '../../utils/createElement.js';


const POSTS_COUNT = 10;


export default class FeedView {
    constructor(menu) {
        this.menu = menu;
    }

    render() {
        const containerObj = new MainLayoutComponent({
            type: 'feed',
        });

        new RadioMenuComponent(containerObj.right, {
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

        const createPostBtn = createElement({
            parent: containerObj.left,
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

        const postsWrapper = createElement({
            parent: containerObj.left,
            classes: ['feed__posts'],
        });

        createPostBtn.addEventListener('click', () => {
            new ModalWindowComponent(containerObj.container, {
                type: 'create-post',
            });
        });

        Ajax.get({
            url: '/feed',
            params: { posts_count: POSTS_COUNT },
            callback: (status, feedData) => {
                let isAuthorized = status === 200;

                if (!isAuthorized) {
                    this.menu.goToPage(this.menu.menuElements.login);
                    this.menu.updateMenuVisibility(false);
                    return;
                }

                if (feedData && Array.isArray(feedData)) {
                    feedData.forEach((config) => {
                        new PostComponent(postsWrapper, config);
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
