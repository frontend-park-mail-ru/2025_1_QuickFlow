import Ajax from '@modules/ajax';
import MessengerComponent from '@components/MessengerComponent/MessengerComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import { getLsItem } from '@utils/localStorage';
import router from '@router';
import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';


class StatsView {
    private containerObj: MainLayoutComponent;

    constructor() {}

    render(params: any) {
        this.containerObj = new MainLayoutComponent().render({
            type: 'stats',
        });

        if (Object.keys(params).length === 0) {
            this.renderStatsMenu();
        } else {
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
        }

        return this.containerObj.container;
    }

    renderStatsMenu() {
        new ButtonComponent(this.containerObj.container, {
            variant: 'secondary',
            text: 'CSAT',
            size: 'small',
            onClick: () => router.go({ path: '/stats?type=general' }),
        });
        new ButtonComponent(this.containerObj.container, {
            variant: 'secondary',
            size: 'small',
            text: 'NPS',
            onClick: () => router.go({ path: '/stats?type=recommendation' }),
        });
        new ButtonComponent(this.containerObj.container, {
            variant: 'secondary',
            text: 'Регистрация',
            size: 'small',
            onClick: () => router.go({ path: '/stats?type=auth' }),
        });
        new ButtonComponent(this.containerObj.container, {
            variant: 'secondary',
            text: 'Создание поста',
            size: 'small',
            onClick: () => router.go({ path: '/stats?type=post' }),
        });
        new ButtonComponent(this.containerObj.container, {
            variant: 'secondary',
            text: 'Мессенджер',
            size: 'small',
            onClick: () => router.go({ path: '/stats?type=messenger' }),
        });
        new ButtonComponent(this.containerObj.container, {
            variant: 'secondary',
            text: 'Профиль',
            size: 'small',
            onClick: () => router.go({ path: '/stats?type=profile' }),
        });

    }

    cbOk(feedbackData: any) {
        let rounded = (num, decimals) => Number(num.toFixed(decimals))

        createElement({
            parent: this.containerObj.container,
            text: `Средннее: ${rounded(feedbackData.payload.average, 2)}`,
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
