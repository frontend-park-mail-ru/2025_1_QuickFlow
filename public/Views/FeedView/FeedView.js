import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import RadioMenuComponent from '../../Components/RadioMenuComponent/RadioMenuComponent.js';
import FeedComponent from '../../Components/FeedComponent/FeedComponent.js';


const HAS_CREATE_BUTTON = true;


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
                            hasCreateButton: HAS_CREATE_BUTTON,
                        });
                    },
                },
                recommendations: {
                    title: 'Рекомендации',
                    onClick: () => {
                        containerObj.left.innerHTML = '';
                        new FeedComponent(containerObj.left, {
                            getUrl: "/recommendations",
                            hasCreateButton: HAS_CREATE_BUTTON,
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
            hasCreateButton: HAS_CREATE_BUTTON,
        });

        return containerObj.container;
    }
}

export default new FeedView();
