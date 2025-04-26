import Ajax from '@modules/ajax';
import MessengerComponent from '@components/MessengerComponent/MessengerComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import { getLsItem } from '@utils/localStorage';
import router from '@router';


class StatsView {
    constructor() {}

    render(params: any) {
        const containerObj = new MainLayoutComponent().render({
            type: 'messenger',
        });

        Ajax.get({
            url: `/feedback`,
            params: {
                type: params.type,
                feedback_count: 25,
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

        return containerObj.container;
    }

    cbOk(feedbackData: any) {
        console.log(feedbackData);
    }
}

export default new StatsView();
