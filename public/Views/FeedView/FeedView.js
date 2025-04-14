import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import RadioMenuComponent from '../../Components/RadioMenuComponent/RadioMenuComponent.js';
import FeedComponent from '../../Components/FeedComponent/FeedComponent.js';


class FeedView {
    constructor() {}

    render() {
        const containerObj = new MainLayoutComponent().render({
            type: 'feed',
        });

        new RadioMenuComponent(containerObj.right, {
            items: {
                feed: {
                    title: 'Лента',
                    onClick: () => {
                        containerObj.left.innerHTML = '';
                        new FeedComponent(containerObj.left, {
                            getUrl: "/feed",
                        });
                    },
                },
                recommendations: {
                    title: 'Рекомендации',
                    onClick: () => {
                        containerObj.left.innerHTML = '';
                        new FeedComponent(containerObj.left, {
                            getUrl: "/recommendations",
                        });
                    },
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

        new FeedComponent(containerObj.left, {
            getUrl: "/feed",
        });

        return containerObj.container;
    }
}

export default new FeedView();
