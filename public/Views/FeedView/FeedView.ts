import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import RadioMenuComponent from '@components/RadioMenuComponent/RadioMenuComponent';
import FeedComponent from '@components/FeedComponent/FeedComponent';
import IFrameComponent from '@components/UI/IFrameComponent/IFrameComponent';
import { getLsItem } from '@utils/localStorage';


const HAS_CREATE_BUTTON = true;


class FeedView {
    private containerObj: MainLayoutComponent;

    constructor() {}

    render() {
        this.containerObj = new MainLayoutComponent().render({
            type: 'feed',
        });

        this.renderFeedbacks();

        new RadioMenuComponent(this.containerObj.right, {
            items: {
                feed: {
                    title: 'Лента',
                    onClick: () => {
                        this.containerObj.left.innerHTML = '';
                        new FeedComponent(this.containerObj.left, {
                            getUrl: "/feed",
                            hasCreateButton: HAS_CREATE_BUTTON,
                            emptyStateText: "Ваша лента пока пуста",
                        });
                    },
                },
                recommendations: {
                    title: 'Рекомендации',
                    onClick: () => {
                        this.containerObj.left.innerHTML = '';
                        new FeedComponent(this.containerObj.left, {
                            getUrl: "/recommendations",
                            hasCreateButton: HAS_CREATE_BUTTON,
                            emptyStateText: "Ваши рекомендации пока пусты",
                        });
                    },
                },
                // comments: {
                //     title: 'Комментарии',
                //     // onClick: () => this.renderSection('education')
                // },
                // reactions: {
                //     title: 'Реакции',
                //     // onClick: () => this.renderSection('education')
                // },
            }
        });

        new FeedComponent(this.containerObj.left, {
            getUrl: "/feed",
            hasCreateButton: HAS_CREATE_BUTTON,
            emptyStateText: "Ваша лента пока пуста",
        });

        return this.containerObj.container;
    }

    renderFeedbacks() {
        if (
            getLsItem('is-general-feedback-given', 'false') === 'false' &&
            getLsItem('is-general-feedback-ready', 'false') === 'true' &&
            getLsItem('is-auth-feedback-given', 'false') === 'true'
        ) {
            new IFrameComponent(this.containerObj.container, {
                src: '/scores?type=general',
            });
        }

        if (getLsItem('is-auth-feedback-given', 'false') === 'false') {
            new IFrameComponent(this.containerObj.container, {
                src: '/scores?type=auth',
            });
        }

        if (
            getLsItem('is-recommendation-feedback-given', 'false') === 'false' &&
            getLsItem('is-general-feedback-given', 'false') === 'true' &&
            getLsItem('is-auth-feedback-given', 'false') === 'true'
        ) {
            new IFrameComponent(this.containerObj.container, {
                src: '/scores?type=recommendation',
            });
        }
    }
}

export default new FeedView();
