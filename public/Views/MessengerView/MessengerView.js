import Ajax from '../../modules/ajax.js';
import MessengerComponent from '../../Components/MessengerComponent/MessengerComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import { getLsItem } from '../../utils/localStorage.js';


export default class MessengerView {
    #containerObj
    #menu
    constructor(menu) {
        this.#menu = menu;
        this.#containerObj = null;
    }

    render() {
        this.#containerObj = new MainLayoutComponent({
            type: 'messenger',
        });

        Ajax.get({
            url: `/profiles/${getLsItem('username', '')}`,
            callback: (status, userData) => {
                let isAuthorized = status === 200;
        
                if (!isAuthorized) {
                    this.#menu.goToPage(this.#menu.menuElements.login);
                    this.#menu.updateMenuVisibility(false);
                    return;
                }
        
                new MessengerComponent(this.#containerObj, {
                    user: userData,
                    menu: this.#menu,
                });
            }
        });

        return this.#containerObj.container;
    }
}
