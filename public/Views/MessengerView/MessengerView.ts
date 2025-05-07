import Ajax from '@modules/ajax';
import MessengerComponent from '@components/MessengerComponent/MessengerComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import { getLsItem } from '@utils/localStorage';
import router from '@router';
import ws from '@modules/WebSocketService';


class MessengerView {
    constructor() {}

    render(params: Record<string, any>) {
        new ws();

        const containerObj = new MainLayoutComponent().render({
            type: 'messenger',
        });

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
