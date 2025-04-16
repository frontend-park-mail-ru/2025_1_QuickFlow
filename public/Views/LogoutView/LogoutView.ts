import Ajax from '@modules/ajax';
import createElement from '@utils/createElement';
import router from '@router';


class LogoutView {
    constructor() {}

    render() {
        Ajax.post({
            url: '/logout',
            callback: (status) => {
                switch (status) {
                    case 200:
                        router.go({ path: '/feed' });
                        break;
                    case 401:
                        router.go({ path: '/login' });
                        break;
                }
            }
        });
    
        return createElement({});
    }
}

export default new LogoutView();
