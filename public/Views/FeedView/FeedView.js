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

        new FeedComponent(containerObj.left, {});

        return containerObj.container;
    }
}

export default new FeedView();
