import createElement from '@utils/createElement';
import router from '@router';
import { AuthRequests } from '@modules/api';
import ws from '@modules/WebSocketService';


class LogoutView {
    constructor() {}

    async render() {
        const status = await AuthRequests.logout();

        switch (status) {
            case 200:
                new ws().close();
                router.go({ path: '/login' });
                break;
        }
    
        return createElement({});
    }
}

export default new LogoutView();
