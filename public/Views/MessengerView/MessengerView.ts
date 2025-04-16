import Ajax from '@modules/ajax';
import MessengerComponent from '@components/MessengerComponent/MessengerComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import { getLsItem } from '@utils/localStorage';
import router from '@router';


class MessengerView {
    constructor() {}

    render(params) {
        const containerObj = new MainLayoutComponent().render({
            type: 'messenger',
        });

        console.log(params);

        // const hasTargetChat = (
        //     typeof params === 'object' &&
        //     Object.keys(params).length &&
        //     (params?.receiver_id || params?.chat_id)
        // );

        Ajax.get({
            url: `/profiles/${getLsItem('username', '')}`,
            callback: (status: number, userData: any) => {
                switch (status) {
                    case 200:
                        new MessengerComponent(containerObj, {
                            user: userData,
                            receiver_username: params?.username,
                            chat_id: params?.chat_id,
                        });
                        break;
                    case 401:
                        router.go({ path: '/login' });
                        break;
                }
            }
        });

        return containerObj.container;
    }
}

export default new MessengerView();
