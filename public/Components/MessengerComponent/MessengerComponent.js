import Ajax from '../../modules/ajax.js';
import ChatsPanelComponent from './ChatsPanelComponent.js';
import ChatWindowComponent from './ChatWindowComponent.js';
import createElement from '../../utils/createElement.js';


export default class MessengerComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.render();
    }

    render() {
        const messengerWrapper = createElement({
            parent: this.#parent.container,
            classes: ['messenger'],
        });

        const chatsPanel = new ChatsPanelComponent(messengerWrapper, {
            user: this.#config.user,
            messenger: this
        });
        const chatWindow = new ChatWindowComponent(messengerWrapper, {
            user: this.#config.user,
            messenger: this
        });

        chatsPanel.chatWindow = chatWindow;
        chatWindow.chatsPanel = chatsPanel;
    }

    ajaxGetChat(username, cb) {
        Ajax.get({
            url: '/chat',
            params: { username },
            callback: (status, chatMsgs) => {
                this.ajaxCallbackAuth(status);
                cb(chatMsgs);
            }
        });
    }

    ajaxGetChats(cb) {
        Ajax.get({
            url: '/chats',
            callback: (status, chatsData) => {
                this.ajaxCallbackAuth(status);
                cb(chatsData);
            }
        });
    }

    ajaxCallbackAuth(status) {
        let isAuthorized = status === 200;
        if (!isAuthorized) {
            this.#config.menu.goToPage(this.#config.menu.menuElements.login);
            this.#config.menu.updateMenuVisibility(false);
            return;
        }
    }
}
