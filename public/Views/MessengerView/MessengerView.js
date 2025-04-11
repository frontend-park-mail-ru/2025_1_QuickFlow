import Ajax from '../../modules/ajax.js';
import MessengerComponent from '../../Components/MessengerComponent/MessengerComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import { getLsItem } from '../../utils/localStorage.js';
import router from '../../Router.js';


class MessengerView {
    constructor() {}

    render() {
        const containerObj = new MainLayoutComponent().render({
            type: 'messenger',
        });

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
                });
            }
        });

        return containerObj.container;
    }
}

export default new MessengerView();
