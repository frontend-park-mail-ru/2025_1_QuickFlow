import Ajax from '@modules/ajax';
import createElement from '@utils/createElement';
import router from '@router';
import API from '@utils/api';


class LogoutView {
    constructor() {}

    async render() {
        const status = await API.logout();

        switch (status) {
            case 200:
                router.go({ path: '/login' });
                break;
        }
    
        return createElement({});
    }
}

export default new LogoutView();
