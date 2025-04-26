import Ajax from '@modules/ajax';
import MessengerComponent from '@components/MessengerComponent/MessengerComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import { getLsItem } from '@utils/localStorage';
import router from '@router';
import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';


class StatsView {
    private containerObj: MainLayoutComponent;

    constructor() {}

    render(params: any) {
        this.containerObj = new MainLayoutComponent().render({
            type: 'stats',
        });

        Ajax.get({
            url: `/feedback`,
            params: {
                type: params.type,
                feedback_count: 50,
            },
            callback: (status: number, feedbackData: any) => {
                switch (status) {
                    case 200:
                        this.cbOk(feedbackData);
                        break;
                    case 401:
                        router.go({ path: '/login' });
                        break;
                }
            }
        });

        return this.containerObj.container;
    }

    cbOk(feedbackData: any) {
        createElement({
            parent: this.containerObj.container,
            text: `Средннее: ${feedbackData.payload.average}`,
            tag: 'h1',
        });

        const feedbacks = createElement({
            parent: this.containerObj.container,
            classes: ['feedbacks'],
        });

        for (const [index, fbData] of feedbackData.payload.feedbacks.entries()) {
            const feedback = createElement({
                parent: feedbacks,
                classes: ['feedback'],
            });

            createElement({
                parent: feedback,
                text: `${index + 1}. ${fbData.firstname} ${fbData.lastname}`,
            });

            createElement({
                parent: feedback,
                text: fbData.text,
                classes: ['feedback__text'],
            });

            const feedbackRating = createElement({
                parent: feedback,
                classes: ['feedback__rating'],
            });

            for (let i = 0; i < fbData.rating; i++) {
                insertIcon(feedbackRating, {
                    name: 'star-fill-icon',
                    classes: ['csat__rate-icon', 'csat__rate-icon_selected'],
                })
            }
        }
    }
}

export default new StatsView();
