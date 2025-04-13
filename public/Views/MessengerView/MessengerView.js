import Ajax from '../../modules/ajax.js';
import MessengerComponent from '../../Components/MessengerComponent/MessengerComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import { getLsItem } from '../../utils/localStorage.js';
import router from '../../Router.js';


class MessengerView {
    constructor() {}

    render(params) {
        const containerObj = new MainLayoutComponent().render({
            type: 'messenger',
        });

        const hasTargetChat = (
            typeof params === 'object' &&
            Object.keys(params).length &&
            params?.username
        );

        Ajax.get({
            url: `/profiles/${getLsItem('username', '')}`,
            callback: (status, userData) => {
                let isAuthorized = status === 200;
        
                if (!isAuthorized) {
                    router.go({ path: '/login' });
                    return;
                }
        
                new MessengerComponent(containerObj, {
                    user: userData,
                    target: hasTargetChat ? params.username : null,
                });
            }
        });

        return containerObj.container;
    }
}

export default new MessengerView();
